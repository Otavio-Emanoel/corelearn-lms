import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { DevService } from "../services/dev.service";
import { LogLevel } from "@prisma/client";

const service = new DevService();

const logsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  level: z.nativeEnum(LogLevel).optional(),
});

const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export class DevController {
  async getMetrics(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(service.getMetrics());
  }

  async getLogs(request: FastifyRequest, reply: FastifyReply) {
    const query = logsQuerySchema.safeParse(request.query);
    if (!query.success) return reply.status(400).send({ error: query.error.flatten() });

    const logs = await service.getLogs(query.data.limit, query.data.level);
    return reply.send(logs);
  }

  async listAdmins(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(await service.listAdmins());
  }

  async createAdmin(request: FastifyRequest, reply: FastifyReply) {
    const body = createAdminSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const admin = await service.createAdmin(body.data);
      const { password: _p, ...safe } = admin;
      return reply.status(201).send(safe);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Creation failed";
      return reply.status(409).send({ error: message });
    }
  }

  async deleteAdmin(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await service.deleteAdmin(request.params.id);
    return reply.status(204).send();
  }
}
