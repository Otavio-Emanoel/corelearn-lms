import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { courseRoutes } from "./course.routes";
import { lessonRoutes } from "./lesson.routes";
import { progressRoutes } from "./progress.routes";
import { devRoutes } from "./dev.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(courseRoutes, { prefix: "/api/courses" });
  await app.register(lessonRoutes, { prefix: "/api/lessons" });
  await app.register(progressRoutes, { prefix: "/api/progress" });
  await app.register(devRoutes, { prefix: "/api/dev" });
}
