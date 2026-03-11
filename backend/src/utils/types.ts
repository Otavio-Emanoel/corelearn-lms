import { Role } from "@prisma/client";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: Role;
      adminId: string | null;
    };
    user: {
      id: string;
      email: string;
      role: Role;
      adminId: string | null;
    };
  }
}

export {};
