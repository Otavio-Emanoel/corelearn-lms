import { prisma } from "../utils/prisma";

export class CourseRepository {
  async create(data: { title: string; description?: string; thumbnail?: string; adminId: string }) {
    return prisma.course.create({ data, include: { modules: true } });
  }

  async findAll(adminId?: string) {
    return prisma.course.findMany({
      where: adminId ? { adminId } : {},
      include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllPublishedByAdmin(adminId: string) {
    return prisma.course.findMany({
      where: { adminId, published: true },
      include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
    });
  }

  async update(id: string, data: { title?: string; description?: string; thumbnail?: string; published?: boolean }) {
    return prisma.course.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.course.delete({ where: { id } });
  }
}
