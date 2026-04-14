import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: ["error", "warn"]
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown Prisma initialization error";
    throw new Error(
      [
        "Prisma Client failed to initialize.",
        "Run these commands in the project root:",
        "1) npm run prisma:generate",
        "2) npm run db:push",
        "3) npm run db:seed",
        `Original error: ${details}`
      ].join("\n")
    );
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
