import { createHash } from "crypto";
import { Role } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";

const repo = new UserRepository();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export class AuthService {
  async register(data: { email: string; name: string; password: string; role?: Role; adminId?: string }) {
    const existing = await repo.findByEmail(data.email);
    if (existing) {
      throw new Error("Email already in use");
    }

    const hashed = hashPassword(data.password);
    return repo.create({
      email: data.email,
      name: data.name,
      password: hashed,
      role: data.role ?? "STUDENT",
      adminId: data.adminId,
    });
  }

  async validateCredentials(email: string, password: string) {
    const user = await repo.findByEmail(email);
    if (!user) return null;

    const hashed = hashPassword(password);
    if (user.password !== hashed) return null;

    return user;
  }

  async findById(id: string) {
    return repo.findById(id);
  }
}
