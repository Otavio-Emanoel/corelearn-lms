import { VideoProvider } from "@prisma/client";
import { prisma } from "../utils/prisma";

export class LessonRepository {
  async create(data: {
    title: string;
    description?: string;
    videoUrl: string;
    videoProvider?: VideoProvider;
    durationSecs?: number;
    order: number;
    moduleId: string;
  }) {
    return prisma.lesson.create({ data });
  }

  async findById(id: string) {
    return prisma.lesson.findUnique({ where: { id }, include: { module: true } });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      videoUrl?: string;
      videoProvider?: VideoProvider;
      durationSecs?: number;
      order?: number;
    },
  ) {
    return prisma.lesson.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.lesson.delete({ where: { id } });
  }
}
