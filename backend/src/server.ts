import Fastify, { FastifyError } from "fastify";
import "./utils/types";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";
import { SystemLogRepository } from "./repositories/systemlog.repository";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

const logRepo = new SystemLogRepository();

async function bootstrap() {
  await registerPlugins(app);
  await registerRoutes(app);

  // Auto-log unhandled errors to SystemLog for the Dev dashboard
  app.setErrorHandler(async (error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const errorMessage = error.message || "Unknown error";
    const errorStack = error.stack;

    // Only log server errors (5xx), not validation/auth errors
    if (statusCode >= 500) {
      try {
        await logRepo.create({
          level: "ERROR",
          message: errorMessage,
          context: {
            stack: errorStack,
            method: request.method,
            url: request.url,
            userId: request.user?.id,
          },
          userId: request.user?.id,
        });
      } catch {
        app.log.error("Failed to persist error log");
      }
    }

    app.log.error(error);
    return reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal Server Error" : errorMessage,
    });
  });

  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || "0.0.0.0";

  try {
    await app.listen({ port, host });
    app.log.info(`CoreLearn API running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();

