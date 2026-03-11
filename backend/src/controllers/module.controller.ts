import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ModuleService } from "../services/module.service";

const service = new ModuleService();

const createSchema = z.object({
    title: z.string().min(1),
    order: z.number().int().nonnegative(),
    courseId: z.string().cuid(),
});

const updateSchema = z.object({
    title: z.string().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
});

export class ModuleController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = createSchema.safeParse(request.body);
        if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

        try {
            const mod = await service.create(body.data, request.user.id, request.user.role);
            return reply.status(201).send(mod);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Creation failed";
            const status = message === "Forbidden" ? 403 : message === "Course not found" ? 404 : 400;
            return reply.status(status).send({ error: message });
        }
    }

    async listByCourse(request: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) {
        return reply.send(await service.listByCourse(request.params.courseId));
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
