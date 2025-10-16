"use server";

import prisma from "@/shared/prisma";

export async function getEmploymentDynamicsReport(
  period: "day" | "month" | "year",
) {
  const formatDate = (date: Date) => {
    if (period === "day") return date.toISOString().slice(0, 10);
    if (period === "month") return date.toISOString().slice(0, 7);
    return date.getFullYear().toString();
  };

  const hiredApps = await prisma.application.findMany({
    where: { status: "hired" },
    select: { updatedAt: true },
  });

  const grouped = hiredApps.reduce((acc: Record<string, number>, app) => {
    const key = formatDate(app.updatedAt);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([period, count]) => ({ period, count }));
}
