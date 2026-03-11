import { prisma } from "../utils/prisma";

export class ProgressRepository {
  async upsert(userId: string, lessonId: string, data: { watchedSecs?: number; lastPosition?: number; completed?: boolean; completedAt?: Date | null }) {
    return prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, ...data },
      update: data,
    });
  }

  async findByUserAndLesson(userId: string, lessonId: string) {
    return prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }

  async findAllByUser(userId: string) {
    return prisma.progress.findMany({
      where: { userId },
      include: { lesson: { include: { module: { include: { course: true } } } } },
    });
  }
}
