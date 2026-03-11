import { FastifyInstance } from "fastify";
import { LessonController } from "../controllers/lesson.controller";

export async function lessonRoutes(app: FastifyInstance) {
  const controller = new LessonController();

  app.post(
    "/",
    { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
    controller.create.bind(controller),
  );
  app.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [app.authenticate] },
    controller.getById.bind(controller),
  );
  app.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
    controller.update.bind(controller),
  );
  app.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
    controller.remove.bind(controller),
  );
}
