"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, GripVertical, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";

interface Lesson {
    id: string;
    title: string;
    videoUrl: string;
    videoProvider: "YOUTUBE" | "VIMEO";
    durationSecs: number;
    order: number;
}
interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}
interface Course {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    published: boolean;
    modules: Module[];
}

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    // Module dialog
    const [moduleOpen, setModuleOpen] = useState(false);
    const [moduleTitle, setModuleTitle] = useState("");

    // Lesson dialog
    const [lessonOpen, setLessonOpen] = useState(false);
    const [lessonModuleId, setLessonModuleId] = useState("");
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonUrl, setLessonUrl] = useState("");
    const [lessonProvider, setLessonProvider] = useState<"YOUTUBE" | "VIMEO">("YOUTUBE");
    const [lessonDuration, setLessonDuration] = useState(0);

    async function loadCourse() {
        try {
            const data = await apiClient.get<Course>(`/courses/${id}`);
            setCourse(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCourse();
    }, [id]);

    async function togglePublish() {
        if (!course) return;
        await apiClient.put(`/courses/${id}`, { published: !course.published });
        loadCourse();
    }

    async function addModule() {
        if (!moduleTitle.trim()) return;
        const order = (course?.modules.length ?? 0);
        await apiClient.post("/modules", { title: moduleTitle, order, courseId: id });
        setModuleTitle("");
        setModuleOpen(false);
        loadCourse();
    }

    async function deleteModule(moduleId: string) {
        await apiClient.delete(`/modules/${moduleId}`);
        loadCourse();
    }

    async function addLesson() {
        if (!lessonTitle.trim() || !lessonUrl.trim()) return;
        const mod = course?.modules.find((m) => m.id === lessonModuleId);
        const order = mod?.lessons.length ?? 0;
        await apiClient.post("/lessons", {
            title: lessonTitle,
            videoUrl: lessonUrl,
            videoProvider: lessonProvider,
            durationSecs: lessonDuration,
            order,
            moduleId: lessonModuleId,
        });
        setLessonTitle("");
        setLessonUrl("");
        setLessonDuration(0);
        setLessonOpen(false);
        loadCourse();
    }

    async function deleteLesson(lessonId: string) {
        await apiClient.delete(`/lessons/${lessonId}`);
        loadCourse();
    }

    if (loading) return <p className="text-muted-foreground">Loading…</p>;
    if (!course) return <p className="text-destructive">Course not found.</p>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <button
                onClick={() => router.push("/admin")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Courses
            </button>

            {/* Course header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    {course.description && <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>}
                </div>
                <div className="flex gap-2">
                    <Button variant={course.published ? "outline" : "default"} size="sm" onClick={togglePublish}>
                        {course.published ? "Unpublish" : "Publish"}
                    </Button>
                </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Modules ({course.modules.length})</h3>
                    <Dialog open={moduleOpen} onOpenChange={setModuleOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Plus className="mr-1 h-4 w-4" /> Add Module
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Module</DialogTitle>
                                <DialogDescription>Add a new module to this course</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <Label htmlFor="mod-title">Module Title</Label>
                                <Input id="mod-title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module 1: Basics" />
                            </div>
                            <DialogFooter>
                                <Button onClick={addModule}>Create Module</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {course.modules.length === 0 && (
                    <p className="text-sm text-muted-foreground">No modules yet. Add your first one!</p>
                )}

                {course.modules.map((mod) => (
                    <div key={mod.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold">{mod.title}</h4>
                                <span className="text-xs text-muted-foreground">({mod.lessons.length} lessons)</span>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setLessonModuleId(mod.id);
                                        setLessonOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteModule(mod.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {mod.lessons.length > 0 && (
                            <ul className="space-y-1 ml-6">
                                {mod.lessons.map((lesson) => (
                                    <li key={lesson.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{lesson.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({lesson.videoProvider} · {Math.floor(lesson.durationSecs / 60)}min)
                                            </span>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => deleteLesson(lesson.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Lesson Dialog */}
            <Dialog open={lessonOpen} onOpenChange={setLessonOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Lesson</DialogTitle>
                        <DialogDescription>Add a video lesson to this module</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="lesson-title">Title</Label>
                            <Input id="lesson-title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson 1: Getting Started" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="lesson-url">Video URL</Label>
                            <Input id="lesson-url" type="url" value={lessonUrl} onChange={(e) => setLessonUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="lesson-provider">Provider</Label>
                                <select
                                    id="lesson-provider"
                                    value={lessonProvider}
                                    onChange={(e) => setLessonProvider(e.target.value as "YOUTUBE" | "VIMEO")}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="YOUTUBE">YouTube</option>
                                    <option value="VIMEO">Vimeo</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="lesson-duration">Duration (seconds)</Label>
                                <Input id="lesson-duration" type="number" min={0} value={lessonDuration} onChange={(e) => setLessonDuration(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={addLesson}>Add Lesson</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
