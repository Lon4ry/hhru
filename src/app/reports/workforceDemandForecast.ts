"use server";

import prisma from "@/shared/prisma";

export async function getWorkforceDemandForecast() {
  const byRegion = await prisma.vacancy.groupBy({
    by: ["city"],
    _count: { id: true },
  });

  const byProfession = await prisma.vacancy.groupBy({
    by: ["title"],
    _count: { id: true },
  });

  return {
    byRegion: byRegion.sort((a, b) => b._count.id - a._count.id),
    byProfession: byProfession.sort((a, b) => b._count.id - a._count.id),
  };
}
