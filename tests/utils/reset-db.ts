import prisma from "@/shared/prisma";

export async function resetDatabase() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.application.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.education.deleteMany(),
    prisma.resume.deleteMany(),
    prisma.vacancy.deleteMany(),
    prisma.company.deleteMany(),
    prisma.systemLog.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
