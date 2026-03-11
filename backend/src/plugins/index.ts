import { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { registerAuthMiddleware } from "../middlewares/auth.middleware";

export async function registerPlugins(app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  await app.register(fastifyCookie);

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "fallback-secret-change-me",
    cookie: {
      cookieName: "token",
      signed: false,
    },
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "CoreLearn LMS API",
        description: "White-label LMS REST API",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "token",
          },
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  await registerAuthMiddleware(app);
}
