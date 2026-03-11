import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { courseRoutes } from "./course.routes";
import { moduleRoutes } from "./module.routes";
import { lessonRoutes } from "./lesson.routes";
import { progressRoutes } from "./progress.routes";
import { studentRoutes } from "./student.routes";
import { reportRoutes } from "./report.routes";
import { devRoutes } from "./dev.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(courseRoutes, { prefix: "/api/courses" });
  await app.register(moduleRoutes, { prefix: "/api/modules" });
  await app.register(lessonRoutes, { prefix: "/api/lessons" });
  await app.register(progressRoutes, { prefix: "/api/progress" });
  await app.register(studentRoutes, { prefix: "/api/students" });
  await app.register(reportRoutes, { prefix: "/api/reports" });
  await app.register(devRoutes, { prefix: "/api/dev" });
}
