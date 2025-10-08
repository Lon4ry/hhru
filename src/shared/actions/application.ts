"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import prisma from "@/shared/prisma";

const applicationSchema = z.object({
  applicantId: z.number(),
  vacancyId: z.number(),
  resumeId: z.number().optional(),
});

export async function createApplicationAction(data: unknown) {
  const parsed = applicationSchema.parse(data);
  const resumeId = parsed.resumeId
    ? parsed.resumeId
    : (
        await prisma.resume.findUnique({
          where: { userId: parsed.applicantId },
          select: { id: true },
        })
      )?.id;
  if (!resumeId) {
    throw new Error("Резюме не найдено");
  }

  const existingApplication = await prisma.application.findFirst({
    where: {
      vacancyId: parsed.vacancyId,
      resumeId,
    },
  });

  if (existingApplication) {
    throw new Error("Отклик на эту вакансию уже существует");
  }

  await prisma.application.create({
    data: {
      applicantId: parsed.applicantId,
      vacancyId: parsed.vacancyId,
      resumeId,
    },
  });

  const applicant = await prisma.user.findUnique({
    where: { id: parsed.applicantId },
  });
  await prisma.systemLog.create({
    data: {
      action: "Создан отклик",
      userEmail: applicant?.email,
    },
  });

  revalidatePath("/applicant/dashboard");
  revalidatePath("/employer/dashboard");
}

const statusSchema = z.object({
  applicationId: z.number(),
  status: z.enum(["pending", "invited", "rejected", "hired"]),
});

export async function updateApplicationStatus(data: unknown) {
  const parsed = statusSchema.parse(data);
  const application = await prisma.application.update({
    where: { id: parsed.applicationId },
    data: { status: parsed.status as never },
    include: { applicant: true, vacancy: true },
  });

  await prisma.notification.create({
    data: {
      userId: application.applicantId,
      title: "Изменение статуса отклика",
      message: `Ваш отклик на вакансию #${application.vacancyId} теперь имеет статус «${statusTitle(parsed.status)}».`,
    },
  });

  await prisma.systemLog.create({
    data: {
      action: `Статус отклика изменён на ${parsed.status}`,
      userEmail: application.applicant.email,
    },
  });

  revalidatePath("/employer/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/applicant/dashboard");
}

function statusTitle(status: string) {
  switch (status) {
    case "invited":
      return "приглашён";
    case "rejected":
      return "отклонён";
    case "hired":
      return "трудоустроен";
    default:
      return "на рассмотрении";
  }
}

const inviteSchema = z.object({
  employerId: z.number(),
  resumeId: z.number(),
});

export async function inviteApplicantToInterview(data: unknown) {
  const parsed = inviteSchema.parse(data);
  const vacancy = await prisma.vacancy.findFirst({
    where: { employerId: parsed.employerId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (!vacancy) {
    throw new Error("Сначала создайте активную вакансию");
  }

  const resume = await prisma.resume.findUnique({
    where: { id: parsed.resumeId },
    select: { userId: true },
  });
  if (!resume) {
    throw new Error("Резюме не найдено");
  }

  const existingApplication = await prisma.application.findFirst({
    where: {
      vacancyId: vacancy.id,
      resumeId: parsed.resumeId,
    },
    include: { applicant: true },
  });

  const application = existingApplication
    ? await prisma.application.update({
        where: { id: existingApplication.id },
        data: { status: "invited" },
        include: { applicant: true },
      })
    : await prisma.application.create({
        data: {
          applicantId: resume.userId,
          vacancyId: vacancy.id,
          resumeId: parsed.resumeId,
          status: "invited",
        },
        include: { applicant: true },
      });

  await prisma.notification.create({
    data: {
      userId: application.applicantId,
      title: "Приглашение на собеседование",
      message: `Работодатель пригласил вас на вакансию «${vacancy.title}». Свяжитесь для выбора даты встречи.`,
    },
  });

  await prisma.systemLog.create({
    data: {
      action: "Отправлено приглашение на собеседование",
      userEmail: application.applicant.email,
    },
  });

  revalidatePath("/employer/dashboard");
}

const inviteResponseSchema = z.object({
  applicationId: z.number(),
  applicantId: z.number(),
  decision: z.enum(["accept", "decline"]),
});

export async function respondToInterviewInvitation(data: unknown) {
  const parsed = inviteResponseSchema.parse(data);
  const application = await prisma.application.findUnique({
    where: { id: parsed.applicationId },
    include: {
      applicant: true,
      vacancy: true,
    },
  });

  if (!application || application.applicantId !== parsed.applicantId) {
    throw new Error("Отклик не найден");
  }

  if (application.status !== "invited") {
    throw new Error("Нельзя ответить на приглашение для данного статуса");
  }

  const nextStatus = parsed.decision === "accept" ? "hired" : "rejected";

  await prisma.application.update({
    where: { id: parsed.applicationId },
    data: { status: nextStatus as never },
  });

  if (application.vacancy?.employerId) {
    await prisma.notification.create({
      data: {
        userId: application.vacancy.employerId,
        title:
          parsed.decision === "accept"
            ? "Кандидат принял приглашение"
            : "Кандидат отказался от приглашения",
        message: `Соискатель ${application.applicant.lastName} ${application.applicant.firstName} ${
          parsed.decision === "accept" ? "принял" : "отклонил"
        } приглашение по вакансии «${application.vacancy.title}».`,
      },
    });
  }

  await prisma.systemLog.create({
    data: {
      action:
        parsed.decision === "accept"
          ? "Приглашение принято кандидатом"
          : "Приглашение отклонено кандидатом",
      userEmail: application.applicant.email,
    },
  });

  revalidatePath("/applicant/dashboard");
  revalidatePath("/employer/dashboard");
}
