"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useVideoStore } from "@/store/video.store";
import { apiClient } from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  videoProvider: "YOUTUBE" | "VIMEO";
  durationSecs: number;
  order: number;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  modules: Module[];
}

function getEmbedUrl(lesson: Lesson): string {
  if (lesson.videoProvider === "YOUTUBE") {
    const match = lesson.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    const id = match?.[1] ?? "";
    return `https://www.youtube.com/embed/${id}?enablejsapi=1`;
  }
  const match = lesson.videoUrl.match(/vimeo\.com\/(\d+)/);
  const id = match?.[1] ?? "";
  return `https://player.vimeo.com/video/${id}?api=1`;
}

export default function ClassroomPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  const { playStartTime, setPlayStartTime, clearPlayStartTime, setLastPosition } = useVideoStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Flatten lessons from all modules
  useEffect(() => {
    async function load() {
      try {
        // Get lesson details
        const lesson = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
        setCurrentLesson(lesson);

        // Get all courses to build the side-list
        const courses = await apiClient.get<CourseData[]>("/courses");
        if (courses.length > 0) {
          setCourseData(courses[0]);
          const flat = courses[0].modules.flatMap((m: Module) => m.lessons);
          setAllLessons(flat);
        }

        // Fire "Play" event to get last position
        const progress = await apiClient.post<{ lastPosition: number }>("/progress/play", {
          lessonId,
        });
        setLastPosition(progress.lastPosition ?? 0);
        setPlayStartTime(Date.now());
      } catch (err) {
        console.error("Failed to load classroom:", err);
      }
    }
    load();
  }, [lessonId, setPlayStartTime, setLastPosition]);

  // Save progress on Pause or page unload
  async function saveProgress(currentPositionSecs: number) {
    if (!playStartTime) return;
    const sessionWatchedSecs = Math.floor((Date.now() - playStartTime) / 1000);
    clearPlayStartTime();

    await apiClient.post("/progress/pause", {
      lessonId,
      currentPositionSecs,
      sessionWatchedSecs,
    });
  }

  // Check completion at 90%
  async function checkCompletion(currentPositionSecs: number, duration: number) {
    if (duration > 0 && currentPositionSecs / duration >= 0.9) {
      try {
        await apiClient.post("/progress/complete", { lessonId, currentPositionSecs });
      } catch {
        // May already be completed
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playStartTime) {
        saveProgress(0);
      }
    };
  }, [playStartTime]);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-6">
      {/* Video Player */}
      <div className="flex flex-1 flex-col gap-4">
        <motion.div
          key={lessonId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg"
        >
          {currentLesson && (
            <iframe
              ref={iframeRef}
              src={getEmbedUrl(currentLesson)}
              className="h-full w-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title={currentLesson.title}
            />
          )}
        </motion.div>

        {/* Lesson title & navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{currentLesson?.title ?? "Loading…"}</h2>
            {courseData && (
              <p className="text-sm text-muted-foreground">{courseData.title}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              disabled={!prevLesson}
              onClick={() => prevLesson && router.push(`/student/classroom/${prevLesson.id}`)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              disabled={!nextLesson}
              onClick={() => nextLesson && router.push(`/student/classroom/${nextLesson.id}`)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lesson List Sidebar */}
      <aside className="flex w-72 flex-col overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 font-semibold">{courseData?.title ?? "Course Content"}</h3>
        {courseData?.modules.map((mod) => (
          <div key={mod.id} className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mod.title}
            </p>
            <ul className="space-y-1">
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === lessonId;
                return (
                  <li key={lesson.id}>
                    <button
                      onClick={() => router.push(`/student/classroom/${lesson.id}`)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="line-clamp-2">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>
    </div>
  );
}
