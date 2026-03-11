import process from "node:process";
import { AuthService } from "../src/services/auth.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const authService = new AuthService();

async function main() {
    const email = "admin@corelearn.com";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log("Admin user already exists");
        return;
    }

    const admin = await authService.register({
        email,
        name: "Admin User",
        password: "password123",
        role: "ADMIN" as any
    });

    console.log("Admin user created:", admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
