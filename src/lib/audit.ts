import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logAudit(
  userId: string,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
