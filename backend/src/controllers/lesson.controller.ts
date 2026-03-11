import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { LessonService } from "../services/lesson.service";

const service = new LessonService();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  videoUrl: z.string().url(),
  videoProvider: z.enum(["YOUTUBE", "VIMEO"]).default("YOUTUBE"),
  durationSecs: z.number().int().nonnegative().default(0),
  order: z.number().int().nonnegative(),
  moduleId: z.string().cuid(),
});

const updateSchema = createSchema.omit({ moduleId: true }).partial();

export class LessonController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const lesson = await service.create(body.data);
    return reply.status(201).send(lesson);
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
      return reply.send(await service.update(request.params.id, body.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      return reply.status(404).send({ error: message });
    }
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await service.remove(request.params.id);
      return reply.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      return reply.status(404).send({ error: message });
    }
  }
}
