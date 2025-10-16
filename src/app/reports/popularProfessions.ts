"use server";

import prisma from "@/shared/prisma";

export async function getPopularProfessions() {
  const result = await prisma.application.groupBy({
    by: ["vacancyId"],
    _count: { vacancyId: true },
  });

  const vacancies = await prisma.vacancy.findMany({
    where: { id: { in: result.map((r) => r.vacancyId) } },
    select: { id: true, title: true, specialization: true },
  });

  const joined = result
    .map((r) => ({
      title: vacancies.find((v) => v.id === r.vacancyId)?.title,
      specialization: vacancies.find((v) => v.id === r.vacancyId)
        ?.specialization,
      applications: r._count.vacancyId,
    }))
    .sort((a, b) => b.applications - a.applications);

  return joined.slice(0, 10); // топ-10
}
