import { randomUUID } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logAudit(
  userId: string,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Prisma.InputJsonValue
) {
  try {
    const metadataJson = JSON.stringify(metadata ?? {});

    await prisma.$executeRaw`
      INSERT INTO audit_log ("id", "userId", "action", "ipAddress", "userAgent", "metadata", "createdAt")
      VALUES (
        ${randomUUID()},
        ${userId},
        ${action},
        ${ipAddress ?? null},
        ${userAgent ?? null},
        ${metadataJson}::jsonb,
        NOW()
      )
    `;
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
