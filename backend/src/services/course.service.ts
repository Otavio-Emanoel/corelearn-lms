import { CourseRepository } from "../repositories/course.repository";

const repo = new CourseRepository();

export class CourseService {
  async create(data: { title: string; description?: string; thumbnail?: string; adminId: string }) {
    return repo.create(data);
  }

  async list(adminId?: string) {
    return repo.findAll(adminId);
  }

  async getById(id: string) {
    const course = await repo.findById(id);
    if (!course) throw new Error("Course not found");
    return course;
  }

  async update(id: string, adminId: string, role: string, data: { title?: string; description?: string; thumbnail?: string; published?: boolean }) {
    const course = await repo.findById(id);
    if (!course) throw new Error("Course not found");
    if (role !== "DEV" && course.adminId !== adminId) {
      throw new Error("Forbidden");
    }
    return repo.update(id, data);
  }

  async remove(id: string, adminId: string, role: string) {
    const course = await repo.findById(id);
    if (!course) throw new Error("Course not found");
    if (role !== "DEV" && course.adminId !== adminId) {
      throw new Error("Forbidden");
    }
    return repo.delete(id);
  }
}
