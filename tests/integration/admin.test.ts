import {
  createApplicationAction,
  createVacancyAction,
  registerApplicant,
  registerEmployer,
  updateApplicationStatus,
} from "@/shared/actions";
import prisma from "@/shared/prisma";
import { Role } from "@prisma/client";

async function seedPlatformData() {
  await registerApplicant({
    lastName: "Сидоров",
    firstName: "Павел",
    patronymic: "Игоревич",
    email: "pavel@applicant.ru",
    phone: "+7 921 111-22-33",
    password: "secret123",
    desiredPosition: "DevOps",
  });

  await registerEmployer({
    companyName: "Digital Lab",
    inn: "7745123456",
    email: "hr@digitallab.ru",
    phone: "+7 495 321-12-12",
    password: "secret321",
  });

  const employer = await prisma.user.findUnique({
    where: { email: "hr@digitallab.ru" },
    include: { company: true },
  });
  const applicant = await prisma.user.findUnique({
    where: { email: "pavel@applicant.ru" },
    include: { resume: true },
  });

  if (!employer?.company || !applicant?.resume) {
    throw new Error("Failed to prepare base data");
  }

  await createVacancyAction({
    employerId: employer.id,
    title: "DevOps Engineer",
    description: "Поддержка инфраструктуры",
    requirements: "Kubernetes",
    conditions: "Гибридный график",
    city: "Москва",
    employmentType: "full_time",
    schedule: "hybrid",
    salaryFrom: 200000,
    salaryTo: 260000,
  });

  const vacancy = await prisma.vacancy.findFirst({
    where: { employerId: employer.id },
  });
  await createApplicationAction({
    applicantId: applicant.id,
    vacancyId: vacancy!.id,
  });

  const application = await prisma.application.findFirst({
    where: { applicantId: applicant.id },
  });
  await updateApplicationStatus({
    applicationId: application!.id,
    status: "hired",
  });
}

describe("Admin analytics", () => {
  it("aggregates user roles, active vacancies and logs", async () => {
    const admin = await prisma.user.create({
      data: {
        email: "admin@stafftech.ru",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        role: Role.ADMIN,
      },
    });

    await seedPlatformData();

    const userCount = await prisma.user.count();
    const applicants = await prisma.user.count({
      where: { role: Role.APPLICANT },
    });
    const employers = await prisma.user.count({
      where: { role: Role.EMPLOYER },
    });
    const activeVacancies = await prisma.vacancy.count({
      where: { isActive: true },
    });
    const hiredCount = await prisma.application.count({
      where: { status: "hired" },
    });
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    expect(userCount).toBeGreaterThanOrEqual(3);
    expect(applicants).toBeGreaterThanOrEqual(1);
    expect(employers).toBeGreaterThanOrEqual(1);
    expect(activeVacancies).toBe(1);
    expect(hiredCount).toBe(1);
    expect(logs.some((log) => log.action.includes("Создана вакансия"))).toBe(
      true,
    );
    expect(logs.some((log) => log.action.includes("Статус отклика"))).toBe(
      true,
    );

    // Ensure admin record still present and unaffected by operations
    const storedAdmin = await prisma.user.findUnique({
      where: { email: admin.email },
    });
    expect(storedAdmin?.role).toBe(Role.ADMIN);
  });
});
