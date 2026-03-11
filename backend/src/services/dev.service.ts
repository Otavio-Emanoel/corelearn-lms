import os from "os";
import { UserRepository } from "../repositories/user.repository";
import { SystemLogRepository } from "../repositories/systemlog.repository";
import { LogLevel } from "@prisma/client";

const userRepo = new UserRepository();
const logRepo = new SystemLogRepository();

export class DevService {
  getMetrics() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: os.platform(),
      cpu: {
        model: cpus[0]?.model ?? "Unknown",
        cores: cpus.length,
      },
      memory: {
        totalMB: Math.round(totalMem / 1024 / 1024),
        usedMB: Math.round(usedMem / 1024 / 1024),
        freeMB: Math.round(freeMem / 1024 / 1024),
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
    };
  }

  async getLogs(limit: number, level?: LogLevel) {
    return logRepo.findAll(limit, level);
  }

  async listAdmins() {
    return userRepo.listByRole("ADMIN");
  }

  async createAdmin(data: { email: string; name: string; password: string }) {
    const { AuthService } = await import("./auth.service");
    const authService = new AuthService();
    return authService.register({ ...data, role: "ADMIN" });
  }

  async deleteAdmin(id: string) {
    return userRepo.deleteById(id);
  }
}
