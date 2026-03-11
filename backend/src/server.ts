import Fastify from "fastify";
import "./utils/types";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function bootstrap() {
  await registerPlugins(app);
  await registerRoutes(app);

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
