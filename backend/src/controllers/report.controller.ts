import { FastifyRequest, FastifyReply } from "fastify";
import { ReportService } from "../services/report.service";

const service = new ReportService();

export class ReportController {
    async getStudentProgress(request: FastifyRequest, reply: FastifyReply) {
        const data = await service.getStudentProgress(request.user.id);
        return reply.send(data);
    }
}
