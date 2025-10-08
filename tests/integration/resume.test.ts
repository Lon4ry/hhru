import { saveResumeAction } from "@/shared/actions";
import prisma from "@/shared/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

describe("Resume actions", () => {
  it("updates resume details, replaces education & experience and logs action", async () => {
    const applicant = await prisma.user.create({
      data: {
        email: "resume@applicant.ru",
        password: "secret123",
        firstName: "Алексей",
        lastName: "Иванов",
        role: Role.APPLICANT,
        resume: {
          create: {
            desiredPosition: "Junior QA",
            city: "Казань",
            summary: "Начинающий тестировщик",
            employmentType: "full_time",
            education: { create: [{ institution: "КФУ" }] },
            experience: {
              create: [{
                company: "StartUp",
                position: "Intern",
                startDate: new Date("2023-01-01"),
                endDate: new Date("2023-06-01"),
              }],
            },
            skills: { create: [{ skill: "Manual QA" }] },
          },
        },
      },
      include: { resume: true },
    });

    const resume = applicant.resume!;

    await saveResumeAction({
      resumeId: resume.id,
      desiredPosition: "Senior QA",
      city: "Москва",
      summary: "Автоматизатор тестирования",
      expectedSalary: 200000,
      employmentType: "full_time",
      skills: ["Playwright", "TypeScript"],
      education: [
        {
          institution: "МГУ",
          degree: "Магистр",
          field: "Прикладная математика",
          startYear: 2014,
          endYear: 2020,
        },
      ],
      experience: [
        {
          company: "Enterprise",
          position: "QA Lead",
          description: "Управление командой",
          startDate: "2021-01-01",
          endDate: "2023-12-01",
        },
      ],
    });

    const updated = await prisma.resume.findUnique({
      where: { id: resume.id },
      include: { education: true, experience: true },
    });

    expect(updated).toMatchObject({
      desiredPosition: "Senior QA",
      city: "Москва",
      expectedSalary: 200000,
    });
    expect(updated?.education).toHaveLength(1);
    expect(updated?.education?.[0]).toMatchObject({ institution: "МГУ", degree: "Магистр" });
    expect(updated?.experience).toHaveLength(1);
    expect(updated?.experience?.[0]).toMatchObject({ company: "Enterprise", position: "QA Lead" });

    const log = await prisma.systemLog.findFirst({ where: { action: "Обновлено резюме", userEmail: applicant.email } });
    expect(log).not.toBeNull();

    expect(revalidatePath).toHaveBeenCalledWith("/applicant/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/applicant/resume/edit");
  });
});
