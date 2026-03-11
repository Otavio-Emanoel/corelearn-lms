import { VideoProvider } from "@prisma/client";
import { LessonRepository } from "../repositories/lesson.repository";

const repo = new LessonRepository();

export class LessonService {
  async create(data: {
    title: string;
    description?: string;
    videoUrl: string;
    videoProvider?: VideoProvider;
    durationSecs?: number;
    order: number;
    moduleId: string;
  }) {
    return repo.create(data);
  }

  async getById(id: string) {
    const lesson = await repo.findById(id);
    if (!lesson) throw new Error("Lesson not found");
    return lesson;
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
    await this.getById(id);
    return repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    return repo.delete(id);
  }
}
