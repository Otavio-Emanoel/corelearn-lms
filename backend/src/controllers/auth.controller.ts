import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const service = new AuthService();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  adminId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    try {
      const user = await service.register(body.data);
      const { password: _p, ...safeUser } = user;
      return reply.status(201).send(safeUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      return reply.status(409).send({ error: message });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const user = await service.validateCredentials(body.data.email, body.data.password);
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = await reply.jwtSign({
      id: user.id,
      email: user.email,
      role: user.role,
      adminId: user.adminId,
    });

    reply.setCookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    const { password: _p, ...safeUser } = user;
    return reply.send({ user: safeUser, token });
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("token", { path: "/" });
    return reply.send({ message: "Logged out" });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await service.findById(request.user.id);
    if (!user) return reply.status(404).send({ error: "User not found" });
    const { password: _p, ...safeUser } = user;
    return reply.send(safeUser);
  }
}
