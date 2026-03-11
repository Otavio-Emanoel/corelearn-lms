"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Users, BarChart3, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  modules: Array<{ lessons: unknown[] }>;
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    apiClient.get<Course[]>("/courses").then(setCourses).catch(console.error);
  }, []);

  const totalLessons = courses.reduce(
    (sum, c) => sum + c.modules.reduce((s, m) => s + (m.lessons as unknown[]).length, 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your courses and students</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: <BookOpen className="h-5 w-5" />, label: "Total Courses", value: courses.length },
          { icon: <BarChart3 className="h-5 w-5" />, label: "Total Lessons", value: totalLessons },
          { icon: <Users className="h-5 w-5" />, label: "Published", value: courses.filter((c) => c.published).length },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              {stat.icon}
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Courses list */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Your Courses</h3>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No courses yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.01 }}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold">{course.title}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      course.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>
                {course.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                )}
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="mt-4 text-xs font-medium text-primary hover:underline"
                >
                  Manage →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
