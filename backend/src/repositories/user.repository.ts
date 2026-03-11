import { Role } from "@prisma/client";
import { prisma } from "../utils/prisma";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; name: string; password: string; role: Role; adminId?: string }) {
    return prisma.user.create({ data });
  }

  async listByRole(role: Role, adminId?: string) {
    return prisma.user.findMany({
      where: { role, ...(adminId ? { adminId } : {}) },
      select: { id: true, email: true, name: true, role: true, adminId: true, createdAt: true },
    });
  }

  async deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
