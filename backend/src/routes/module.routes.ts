import { FastifyInstance } from "fastify";
import { ModuleController } from "../controllers/module.controller";

export async function moduleRoutes(app: FastifyInstance) {
    const controller = new ModuleController();

    app.post(
        "/",
        { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
        controller.create.bind(controller),
    );
    app.get<{ Params: { courseId: string } }>(
        "/course/:courseId",
        { preHandler: [app.authenticate] },
        controller.listByCourse.bind(controller),
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
