import { createApplicationAction, inviteApplicantToInterview, updateApplicationStatus } from "@/shared/actions";
import prisma from "@/shared/prisma";
import { ApplicationStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

describe("Application actions", () => {
  async function createBaseData() {
    const employer = await prisma.user.create({
      data: {
        email: "employer@apps.ru",
        password: "secret123",
        firstName: "Елена",
        lastName: "HR",
        role: Role.EMPLOYER,
        company: {
          create: {
            name: "Apps Corp",
            inn: "7712345678",
            email: "apps@corp.ru",
          },
        },
        vacancies: {
          create: [{
            title: "Backend Developer",
            description: "Создание микросервисов",
            requirements: "Node.js",
            conditions: "Опционы",
            city: "Москва",
            employmentType: "full_time",
            schedule: "remote",
            salaryFrom: 180000,
            salaryTo: 250000,
          }],
        },
      },
      include: { vacancies: true },
    });

    const applicant = await prisma.user.create({
      data: {
        email: "candidate@apps.ru",
        password: "candidate123",
        firstName: "Михаил",
        lastName: "Смирнов",
        role: Role.APPLICANT,
        resume: {
          create: {
            desiredPosition: "Backend Developer",
            city: "Москва",
            employmentType: "full_time",
            skills: { create: [{ skill: "Node.js" }] },
          },
        },
      },
      include: { resume: true },
    });

    return { employer, applicant };
  }

  it("creates application using resume fallback and logs action", async () => {
    const { employer, applicant } = await createBaseData();

    await createApplicationAction({ applicantId: applicant.id, vacancyId: employer.vacancies[0].id });

    const application = await prisma.application.findFirst({
      where: { applicantId: applicant.id, vacancyId: employer.vacancies[0].id },
    });

    expect(application).toMatchObject({ status: ApplicationStatus.pending, resumeId: applicant.resume?.id ?? undefined });

    const log = await prisma.systemLog.findFirst({ where: { action: "Создан отклик", userEmail: applicant.email } });
    expect(log).not.toBeNull();

    expect(revalidatePath).toHaveBeenCalledWith("/applicant/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/employer/dashboard");
  });

  it("updates application status, sends notification and logs", async () => {
    const { employer, applicant } = await createBaseData();

    const application = await prisma.application.create({
      data: {
        applicantId: applicant.id,
        vacancyId: employer.vacancies[0].id,
        resumeId: applicant.resume?.id!,
        status: ApplicationStatus.pending,
      },
      include: { applicant: true },
    });

    await updateApplicationStatus({ applicationId: application.id, status: "invited" });

    const updated = await prisma.application.findUnique({ where: { id: application.id } });
    expect(updated?.status).toBe(ApplicationStatus.invited);

    const notification = await prisma.notification.findFirst({ where: { userId: applicant.id } });
    expect(notification?.title).toBe("Изменение статуса отклика");

    const log = await prisma.systemLog.findFirst({ where: { action: { contains: "Статус отклика" } } });
    expect(log?.userEmail).toBe(applicant.email);

    expect(revalidatePath).toHaveBeenCalledWith("/employer/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("invites applicant to interview using most recent vacancy", async () => {
    const { employer, applicant } = await createBaseData();

    await inviteApplicantToInterview({ employerId: employer.id, resumeId: applicant.resume?.id! });

    const application = await prisma.application.findFirst({
      where: { applicantId: applicant.id, status: ApplicationStatus.invited },
      include: { vacancy: true },
    });

    expect(application?.vacancyId).toBe(employer.vacancies[0].id);

    const notification = await prisma.notification.findFirst({ where: { userId: applicant.id, title: "Приглашение на собеседование" } });
    expect(notification).not.toBeNull();

    const log = await prisma.systemLog.findFirst({ where: { action: "Отправлено приглашение на собеседование" } });
    expect(log?.userEmail).toBe(applicant.email);
  });
});
