"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import prisma from "@/shared/prisma";

const vacancySchema = z.object({
  employerId: z.number(),
  title: z.string().min(3, "Укажите должность"),
  description: z.string().min(10, "Добавьте описание"),
  requirements: z.string().min(10, "Перечислите требования"),
  conditions: z.string().min(10, "Опишите условия"),
  city: z.string().min(2, "Укажите город"),
  employmentType: z.string().optional(),
  schedule: z.string().optional(),
  salaryFrom: z.coerce.number().min(0).optional(),
  salaryTo: z.coerce.number().min(0).optional(),
});

export async function createVacancyAction(data: unknown) {
  const parsed = vacancySchema.parse(data);
  const employmentType = parsed.employmentType
    ? (parsed.employmentType as never)
    : undefined;
  const schedule = parsed.schedule ? (parsed.schedule as never) : undefined;
  const vacancy = await prisma.vacancy.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      requirements: parsed.requirements,
      conditions: parsed.conditions,
      city: parsed.city,
      employmentType,
      schedule,
      salaryFrom: parsed.salaryFrom,
      salaryTo: parsed.salaryTo,
      employerId: parsed.employerId,
      companyId: (
        await prisma.company.findFirst({
          where: { userId: parsed.employerId },
          select: { id: true },
        })
      )?.id,
    },
  });

  const employer = await prisma.user.findUnique({
    where: { id: parsed.employerId },
  });
  await prisma.systemLog.create({
    data: {
      action: `Создана вакансия ${vacancy.title}`,
      userEmail: employer?.email,
    },
  });

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/vacancies");
  revalidatePath("/jobs/search");
  redirect("/employer/vacancies");
}

export async function toggleVacancyStatus(id: number, isActive: boolean) {
  await prisma.vacancy.update({ where: { id }, data: { isActive } });
  revalidatePath("/employer/vacancies");
  revalidatePath("/jobs/search");
}
