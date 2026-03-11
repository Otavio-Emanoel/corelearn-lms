import { prisma } from "../utils/prisma";

export class ModuleRepository {
    async create(data: { title: string; order: number; courseId: string }) {
        return prisma.module.create({ data, include: { lessons: { orderBy: { order: "asc" } } } });
    }

    async findById(id: string) {
        return prisma.module.findUnique({
            where: { id },
            include: { lessons: { orderBy: { order: "asc" } }, course: true },
        });
    }

    async findByCourse(courseId: string) {
        return prisma.module.findMany({
            where: { courseId },
            include: { lessons: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
        });
    }

    async update(id: string, data: { title?: string; order?: number }) {
        return prisma.module.update({
            where: { id },
            data,
            include: { lessons: { orderBy: { order: "asc" } } },
        });
    }

    async delete(id: string) {
        return prisma.module.delete({ where: { id } });
    }
}
