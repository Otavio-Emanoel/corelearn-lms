"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
}
interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}
interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  modules: Module[];
}

interface ProgressEntry {
  lessonId: string;
  completed: boolean;
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, progressData] = await Promise.all([
          apiClient.get<Course[]>("/courses"),
          apiClient.get<ProgressEntry[]>("/progress").catch(() => [] as ProgressEntry[]),
        ]);
        setCourses(coursesData);
        const map = new Map<string, boolean>();
        progressData.forEach((p) => map.set(p.lessonId, p.completed));
        setProgressMap(map);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Courses</h2>
        <p className="text-sm text-muted-foreground mt-1">Continue where you left off</p>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground text-sm">No courses assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const allLessons = course.modules.flatMap((m) => m.lessons);
            const totalLessons = allLessons.length;
            const completedLessons = allLessons.filter((l) => progressMap.get(l.id)).length;
            const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const firstLesson = course.modules[0]?.lessons[0];

            return (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {/* Thumbnail placeholder */}
                <div className="flex h-36 items-center justify-center bg-primary/10">
                  <BookOpen className="h-12 w-12 text-primary/40" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{course.title}</h3>
                  {course.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  )}

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{completedLessons}/{totalLessons} lessons</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} />
                  </div>

                  {firstLesson && (
                    <Link
                      href={`/student/classroom/${firstLesson.id}`}
                      className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {percent > 0 ? "Continue Learning →" : "Start Learning →"}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
