import { FastifyInstance } from "fastify";
import { CourseController } from "../controllers/course.controller";

export async function courseRoutes(app: FastifyInstance) {
  const controller = new CourseController();

  app.post(
    "/",
    { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
    controller.create.bind(controller),
  );
  app.get("/", { preHandler: [app.authenticate] }, controller.list.bind(controller));
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
