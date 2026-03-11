import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { Role } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";

const repo = new UserRepository();

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
    return timingSafeEqual(Buffer.from(hash, "hex"), derived);
  } catch {
    return false;
  }
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

    if (!verifyPassword(password, user.password)) return null;

    return user;
  }

  async findById(id: string) {
    return repo.findById(id);
  }
}
