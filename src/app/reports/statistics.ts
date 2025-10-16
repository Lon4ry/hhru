"use server";

import prisma from "@/shared/prisma";

export async function getUsersStatistics() {
  const totalApplicants = await prisma.user.count({
    where: { role: "APPLICANT" },
  });
  const totalEmployers = await prisma.user.count({
    where: { role: "EMPLOYER" },
  });

  const newApplicants = await prisma.user.count({
    where: {
      role: "APPLICANT",
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
  });

  const newEmployers = await prisma.user.count({
    where: {
      role: "EMPLOYER",
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
  });

  return {
    totalApplicants,
    totalEmployers,
    newApplicants,
    newEmployers,
  };
}
