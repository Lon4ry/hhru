import { createVacancyAction, toggleVacancyStatus } from "@/shared/actions";
import prisma from "@/shared/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

describe("Vacancy actions", () => {
  it("creates vacancy linked to employer company and logs action", async () => {
    const employer = await prisma.user.create({
      data: {
        email: "employer@company.ru",
        password: "secret123",
        firstName: "Анна",
        lastName: "HR",
        role: Role.EMPLOYER,
        company: {
          create: {
            name: "Company LLC",
            inn: "7701234567",
            email: "info@company.ru",
            phone: "+7 495 123-45-67",
          },
        },
      },
      include: { company: true },
    });

    await createVacancyAction({
      employerId: employer.id,
      title: "QA Lead",
      description: "Внедрение автоматизации",
      requirements: "Опыт 5+ лет",
      conditions: "ДМС и опции",
      city: "Москва",
      employmentType: "full_time",
      schedule: "hybrid",
      salaryFrom: 180000,
      salaryTo: 240000,
    });

    const vacancy = await prisma.vacancy.findFirst({
      where: { employerId: employer.id },
    });

    expect(vacancy).toMatchObject({
      title: "QA Lead",
      companyId: employer.company?.id,
      salaryFrom: 180000,
      salaryTo: 240000,
    });

    const log = await prisma.systemLog.findFirst({
      where: { action: { contains: "Создана вакансия" } },
    });
    expect(log?.userEmail).toBe(employer.email);

    expect(redirect).toHaveBeenCalledWith("/employer/vacancies");
    expect(revalidatePath).toHaveBeenCalledWith("/employer/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/employer/vacancies");
  });

  it("toggles vacancy status", async () => {
    const employer = await prisma.user.create({
      data: {
        email: "status@company.ru",
        password: "secret123",
        firstName: "Сергей",
        lastName: "HR",
        role: Role.EMPLOYER,
        company: {
          create: {
            name: "Status Corp",
            inn: "7734567890",
            email: "contact@status.ru",
          },
        },
        vacancies: {
          create: [
            {
              title: "Frontend Developer",
              description: "Развитие фронтенда",
              requirements: "React",
              conditions: "Удаленно",
              city: "Казань",
              salaryFrom: 120000,
              salaryTo: 150000,
            },
          ],
        },
      },
      include: { vacancies: true },
    });

    const vacancy = employer.vacancies[0];
    await toggleVacancyStatus(vacancy.id, false);

    const updated = await prisma.vacancy.findUnique({
      where: { id: vacancy.id },
    });
    expect(updated?.isActive).toBe(false);
  });
});
