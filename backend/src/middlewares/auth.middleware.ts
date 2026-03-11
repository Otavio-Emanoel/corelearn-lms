import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Role } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: Role[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerAuthMiddleware(app: FastifyInstance) {
  app.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const token =
          request.cookies?.token ||
          (request.headers.authorization?.startsWith("Bearer ")
            ? request.headers.authorization.slice(7)
            : undefined);

        if (!token) {
          return reply.status(401).send({ error: "Unauthorized: No token provided" });
        }

        const payload = app.jwt.verify<{
          id: string;
          email: string;
          role: Role;
          adminId: string | null;
        }>(token);
        request.user = payload;
      } catch {
        return reply.status(401).send({ error: "Unauthorized: Invalid token" });
      }
    },
  );

  app.decorate("requireRole", (roles: Role[]) => {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      if (!request.user || !roles.includes(request.user.role)) {
        return reply.status(403).send({ error: "Forbidden: Insufficient permissions" });
      }
    };
  });
}
