import process from "node:process";
import { AuthService } from "../src/services/auth.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const authService = new AuthService();

async function main() {
    try {
        const users = [
            {
                email: "admin@corelearn.com",
                name: "Admin User",
                password: "senha123",
                role: "ADMIN" as any
            },
            {
                email: "aluno@corelearn.com",
                name: "Student User",
                password: "senha123",
                role: "STUDENT" as any
            },
            {
                email: "dev@corelearn.com",
                name: "Dev User",
                password: "senha123",
                role: "DEV" as any
            }
        ];
        for (let i = 0; i < users.length; i++) {
            const email = users[i].email;

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                console.log(`User already exists: ${email}`);
                continue;
            }

            const user = await authService.register({
                email,
                name: users[i].name,
                password: users[i].password,
                role: users[i].role
            });

            console.log("User created:", user.email);
        }
    } catch (error) {
        console.error("Error creating users:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
