import { prisma } from "../utils/prisma";

export class ReportService {
    /**
     * Returns per-student progress data for all students belonging to a given admin.
     * For each student: name, email, courses with completion percentage and total watched time.
     */
    async getStudentProgress(adminId: string) {
        const students = await prisma.user.findMany({
            where: { adminId, role: "STUDENT" },
            select: {
                id: true,
                name: true,
                email: true,
                progress: {
                    select: {
                        watchedSecs: true,
                        completed: true,
                        lesson: {
                            select: {
                                id: true,
                                module: {
                                    select: {
                                        courseId: true,
                                        course: { select: { id: true, title: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return students.map((student) => {
            // Group progress by course
            const courseMap = new Map<string, {
                courseId: string;
                courseTitle: string;
                totalLessons: number;
                completedLessons: number;
                totalWatchedSecs: number;
            }>();

            for (const p of student.progress) {
                const courseId = p.lesson.module.courseId;
                const courseTitle = p.lesson.module.course.title;

                if (!courseMap.has(courseId)) {
                    courseMap.set(courseId, {
                        courseId,
                        courseTitle,
                        totalLessons: 0,
                        completedLessons: 0,
                        totalWatchedSecs: 0,
                    });
                }

                const entry = courseMap.get(courseId)!;
                entry.totalLessons++;
                if (p.completed) entry.completedLessons++;
                entry.totalWatchedSecs += p.watchedSecs;
            }

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                courses: Array.from(courseMap.values()).map((c) => ({
                    ...c,
                    completionPercent: c.totalLessons > 0
                        ? Math.round((c.completedLessons / c.totalLessons) * 100)
                        : 0,
                })),
            };
        });
    }
}
