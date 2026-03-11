import { FastifyInstance } from "fastify";
import { StudentController } from "../controllers/student.controller";

export async function studentRoutes(app: FastifyInstance) {
    const controller = new StudentController();

    app.get(
        "/",
        { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
        controller.list.bind(controller),
    );
    app.post(
        "/",
        { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
        controller.create.bind(controller),
    );
    app.delete<{ Params: { id: string } }>(
        "/:id",
        { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
        controller.remove.bind(controller),
    );
}
