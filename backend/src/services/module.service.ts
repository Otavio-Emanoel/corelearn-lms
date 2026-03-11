import { ModuleRepository } from "../repositories/module.repository";
import { CourseRepository } from "../repositories/course.repository";

const moduleRepo = new ModuleRepository();
const courseRepo = new CourseRepository();

export class ModuleService {
    async create(data: { title: string; order: number; courseId: string }, adminId: string, role: string) {
        const course = await courseRepo.findById(data.courseId);
        if (!course) throw new Error("Course not found");
        if (role !== "DEV" && course.adminId !== adminId) throw new Error("Forbidden");

        return moduleRepo.create(data);
    }

    async listByCourse(courseId: string) {
        return moduleRepo.findByCourse(courseId);
    }

    async getById(id: string) {
        const mod = await moduleRepo.findById(id);
        if (!mod) throw new Error("Module not found");
        return mod;
    }

    async update(id: string, adminId: string, role: string, data: { title?: string; order?: number }) {
        const mod = await moduleRepo.findById(id);
        if (!mod) throw new Error("Module not found");
        if (role !== "DEV" && mod.course.adminId !== adminId) throw new Error("Forbidden");

        return moduleRepo.update(id, data);
    }

    async remove(id: string, adminId: string, role: string) {
        const mod = await moduleRepo.findById(id);
        if (!mod) throw new Error("Module not found");
        if (role !== "DEV" && mod.course.adminId !== adminId) throw new Error("Forbidden");

        return moduleRepo.delete(id);
    }
}
