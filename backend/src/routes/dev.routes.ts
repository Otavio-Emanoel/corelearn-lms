import { FastifyInstance } from "fastify";
import { DevController } from "../controllers/dev.controller";

export async function devRoutes(app: FastifyInstance) {
  const controller = new DevController();

  app.get(
    "/metrics",
    { preHandler: [app.authenticate, app.requireRole(["DEV"])] },
    controller.getMetrics.bind(controller),
  );

  app.get(
    "/logs",
    { preHandler: [app.authenticate, app.requireRole(["DEV"])] },
    controller.getLogs.bind(controller),
  );

  app.get(
    "/admins",
    { preHandler: [app.authenticate, app.requireRole(["DEV"])] },
    controller.listAdmins.bind(controller),
  );

  app.post(
    "/admins",
    { preHandler: [app.authenticate, app.requireRole(["DEV"])] },
    controller.createAdmin.bind(controller),
  );

  app.delete<{ Params: { id: string } }>(
    "/admins/:id",
    { preHandler: [app.authenticate, app.requireRole(["DEV"])] },
    controller.deleteAdmin.bind(controller),
  );
}
