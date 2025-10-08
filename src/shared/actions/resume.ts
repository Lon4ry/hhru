"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import prisma from "@/shared/prisma";

const educationSchema = z.object({
  institution: z.string().min(2, "Укажите учебное заведение"),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  endYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional(),
});

const experienceSchema = z.object({
  company: z.string().min(2, "Укажите компанию"),
  position: z.string().min(2, "Укажите должность"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const resumeSchema = z.object({
  resumeId: z.number(),
  desiredPosition: z.string().min(2),
  city: z.string().min(2),
  summary: z.string().optional(),
  expectedSalary: z.coerce.number().min(10000).max(1000000).optional(),
  employmentType: z.string().optional(),
  skills: z.array(z.string().min(1)),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
});

export async function saveResumeAction(data: unknown) {
  const parsed = resumeSchema.parse(data);
  const resume = await prisma.resume.update({
    where: { id: parsed.resumeId },
    data: {
      desiredPosition: parsed.desiredPosition,
      city: parsed.city,
      summary: parsed.summary,
      expectedSalary: parsed.expectedSalary,
      employmentType: parsed.employmentType as never,
      skills: parsed.skills,
    },
  });

  await prisma.education.deleteMany({ where: { resumeId: resume.id } });
  await prisma.experience.deleteMany({ where: { resumeId: resume.id } });

  if (parsed.education.length > 0) {
    await prisma.education.createMany({
      data: parsed.education.map((item) => ({
        resumeId: resume.id,
        institution: item.institution,
        degree: item.degree,
        field: item.field,
        startYear: item.startYear,
        endYear: item.endYear,
      })),
    });
  }

  if (parsed.experience.length > 0) {
    await prisma.experience.createMany({
      data: parsed.experience.map((item) => ({
        resumeId: resume.id,
        company: item.company,
        position: item.position,
        description: item.description,
        startDate: item.startDate ? new Date(item.startDate) : undefined,
        endDate: item.endDate ? new Date(item.endDate) : undefined,
      })),
    });
  }

  const user = await prisma.user.findUnique({ where: { id: resume.userId } });
  await prisma.systemLog.create({
    data: {
      action: "Обновлено резюме",
      userEmail: user?.email,
    },
  });

  revalidatePath("/applicant/dashboard");
  revalidatePath("/applicant/resume/edit");
}
