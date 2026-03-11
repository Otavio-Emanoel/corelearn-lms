import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ProgressService } from "../services/progress.service";

const service = new ProgressService();

const playSchema = z.object({ lessonId: z.string().cuid() });

const pauseSchema = z.object({
  lessonId: z.string().cuid(),
  currentPositionSecs: z.number().int().nonnegative(),
  sessionWatchedSecs: z.number().int().nonnegative(),
});

const completeSchema = z.object({
  lessonId: z.string().cuid(),
  currentPositionSecs: z.number().int().nonnegative(),
});

export class ProgressController {
  async play(request: FastifyRequest, reply: FastifyReply) {
    const body = playSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const progress = await service.onPlay(request.user.id, body.data.lessonId);
    return reply.send(progress);
  }

  async pause(request: FastifyRequest, reply: FastifyReply) {
    const body = pauseSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const progress = await service.onPause(
      request.user.id,
      body.data.lessonId,
      body.data.currentPositionSecs,
      body.data.sessionWatchedSecs,
    );
    return reply.send(progress);
  }

  async complete(request: FastifyRequest, reply: FastifyReply) {
    const body = completeSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    try {
      const progress = await service.onComplete(
        request.user.id,
        body.data.lessonId,
        body.data.currentPositionSecs,
      );
      return reply.send(progress);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Completion failed";
      return reply.status(400).send({ error: message });
    }
  }

  async getByLesson(request: FastifyRequest<{ Params: { lessonId: string } }>, reply: FastifyReply) {
    const progress = await service.getByLesson(request.user.id, request.params.lessonId);
    return reply.send(progress ?? null);
  }
}
