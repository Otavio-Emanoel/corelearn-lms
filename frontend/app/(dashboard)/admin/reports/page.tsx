"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api";

interface CourseProgress {
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    totalWatchedSecs: number;
    completionPercent: number;
}

interface StudentReport {
    id: string;
    name: string;
    email: string;
    courses: CourseProgress[];
}

function formatTime(secs: number): string {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export default function ReportsPage() {
    const [data, setData] = useState<StudentReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get<StudentReport[]>("/reports/progress")
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-muted-foreground">Loading reports…</p>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Student Reports</h2>
                <p className="text-sm text-muted-foreground mt-1">Track progress and engagement across your students</p>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No student data yet.</p>
            ) : (
                <div className="space-y-4">
                    {data.map((student, i) => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-xl border border-border bg-card p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold">{student.name}</h3>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>

                            {student.courses.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No course activity yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {student.courses.map((course) => (
                                        <div key={course.courseId} className="rounded-lg bg-muted/30 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">{course.courseTitle}</span>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {course.completedLessons}/{course.totalLessons}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(course.totalWatchedSecs)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress value={course.completionPercent} className="flex-1" />
                                                <span className="text-xs font-medium w-8 text-right">{course.completionPercent}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
