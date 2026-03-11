import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CourseService } from "../services/course.service";

const service = new CourseService();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

const updateSchema = createSchema.partial().extend({
  published: z.boolean().optional(),
});

export class CourseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const course = await service.create({ ...body.data, adminId: request.user.id });
    return reply.status(201).send(course);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const adminId = request.user.role === "ADMIN" ? request.user.id : undefined;
    return reply.send(await service.list(adminId));
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      return reply.send(await service.getById(request.params.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Not found";
      return reply.status(404).send({ error: message });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = updateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      return reply.send(await service.update(request.params.id, request.user.id, request.user.role, body.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      const status = message === "Forbidden" ? 403 : 404;
      return reply.status(status).send({ error: message });
    }
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await service.remove(request.params.id, request.user.id, request.user.role);
      return reply.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      const status = message === "Forbidden" ? 403 : 404;
      return reply.status(status).send({ error: message });
    }
  }
}
