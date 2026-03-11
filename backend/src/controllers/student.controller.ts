import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";

const authService = new AuthService();
const userRepo = new UserRepository();

const createStudentSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6),
});

export class StudentController {
    async list(request: FastifyRequest, reply: FastifyReply) {
        const students = await userRepo.listStudentsByAdmin(request.user.id);
        return reply.send(students);
    }

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = createStudentSchema.safeParse(request.body);
        if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

        try {
            const student = await authService.register({
                ...body.data,
                role: "STUDENT",
                adminId: request.user.id,
            });
            const { password: _p, ...safe } = student;
            return reply.status(201).send(safe);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Creation failed";
            return reply.status(409).send({ error: message });
        }
    }

    async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        // Ensure the student belongs to this admin
        const student = await userRepo.findById(request.params.id);
        if (!student || student.role !== "STUDENT") {
            return reply.status(404).send({ error: "Student not found" });
        }
        if (student.adminId !== request.user.id && request.user.role !== "DEV") {
            return reply.status(403).send({ error: "Forbidden" });
        }

        await userRepo.deleteById(request.params.id);
        return reply.status(204).send();
    }
}
