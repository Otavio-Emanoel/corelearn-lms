import { FastifyInstance } from "fastify";
import { ReportController } from "../controllers/report.controller";

export async function reportRoutes(app: FastifyInstance) {
    const controller = new ReportController();

    app.get(
        "/progress",
        { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
        controller.getStudentProgress.bind(controller),
    );
}
