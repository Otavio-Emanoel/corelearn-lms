import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.post(
    "/register",
    { preHandler: [app.authenticate, app.requireRole(["ADMIN", "DEV"])] },
    controller.register.bind(controller),
  );
  app.post("/login", controller.login.bind(controller));
  app.post("/logout", controller.logout.bind(controller));
  app.get("/me", { preHandler: [app.authenticate] }, controller.me.bind(controller));
}
