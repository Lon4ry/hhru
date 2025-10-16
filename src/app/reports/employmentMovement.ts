"use server";

import prisma from "@/shared/prisma";

export async function getEmploymentMovementReport(start: Date, end: Date) {
  const hired = await prisma.application.count({
    where: { status: "hired", updatedAt: { gte: start, lte: end } },
  });

  const rejected = await prisma.application.count({
    where: { status: "rejected", updatedAt: { gte: start, lte: end } },
  });

  const pending = await prisma.application.count({
    where: { status: "pending", updatedAt: { gte: start, lte: end } },
  });

  return { hired, rejected, pending };
}
