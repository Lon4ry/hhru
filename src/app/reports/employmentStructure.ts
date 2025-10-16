"use server";

import prisma from "@/shared/prisma";

export async function getEmploymentStructure() {
  const byRegion = await prisma.vacancy.groupBy({
    by: ["city"],
    _count: { id: true },
  });

  const bySpecialization = await prisma.vacancy.groupBy({
    by: ["specialization"],
    _count: { id: true },
  });

  const byEmploymentType = await prisma.vacancy.groupBy({
    by: ["employmentType"],
    _count: { id: true },
  });

  return {
    byRegion,
    bySpecialization,
    byEmploymentType,
  };
}
