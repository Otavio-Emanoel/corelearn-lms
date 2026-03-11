import { FastifyInstance } from "fastify";
import { ProgressController } from "../controllers/progress.controller";

export async function progressRoutes(app: FastifyInstance) {
  const controller = new ProgressController();

  app.post(
    "/play",
    { preHandler: [app.authenticate, app.requireRole(["STUDENT"])] },
    controller.play.bind(controller),
  );

  app.post(
    "/pause",
    { preHandler: [app.authenticate, app.requireRole(["STUDENT"])] },
    controller.pause.bind(controller),
  );

  app.post(
    "/complete",
    { preHandler: [app.authenticate, app.requireRole(["STUDENT"])] },
    controller.complete.bind(controller),
  );

  app.get(
    "/",
    { preHandler: [app.authenticate] },
    controller.getAll.bind(controller),
  );

  app.get<{ Params: { lessonId: string } }>(
    "/:lessonId",
    { preHandler: [app.authenticate] },
    controller.getByLesson.bind(controller),
  );
}
