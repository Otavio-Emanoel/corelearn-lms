import { LogLevel } from "@prisma/client";
import { prisma } from "../utils/prisma";

export class SystemLogRepository {
  async create(data: { level: LogLevel; message: string; context?: object; userId?: string }) {
    return prisma.systemLog.create({ data: { ...data, context: data.context ?? undefined } });
  }

  async findAll(limit = 100, level?: LogLevel) {
    return prisma.systemLog.findMany({
      where: level ? { level } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
