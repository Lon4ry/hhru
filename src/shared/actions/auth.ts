"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import prisma from "@/shared/prisma";

const applicantSchema = z.object({
  lastName: z.string().min(1, "Укажите фамилию"),
  firstName: z.string().min(1, "Укажите имя"),
  patronymic: z.string().optional(),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  password: z.string().min(6, "Минимум 6 символов"),
  desiredPosition: z.string().min(2, "Укажите желаемую должность"),
});

const employerSchema = z.object({
  companyName: z.string().min(2, "Введите название компании"),
  inn: z.string().min(10, "ИНН должен содержать минимум 10 цифр"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export async function registerApplicant(formData: unknown) {
  const parsed = applicantSchema.parse(formData);
  const password = parsed.password;
  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      password,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      patronymic: parsed.patronymic,
      phone: parsed.phone,
      role: "APPLICANT",
      resume: {
        create: {
          desiredPosition: parsed.desiredPosition,
          city: "",
        },
      },
      notifications: {
        create: {
          title: "Добро пожаловать!",
          message: "Добавьте образование и опыт, чтобы раскрыть свой потенциал.",
        },
      },
    },
  });

  await prisma.systemLog.create({
    data: {
      action: "Регистрация соискателя",
      userEmail: user.email,
    },
  });

  redirect("/auth/login?registered=applicant");
}

export async function registerEmployer(formData: unknown) {
  const parsed = employerSchema.parse(formData);
  const password = parsed.password;
  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      password,
      firstName: parsed.companyName,
      lastName: "",
      phone: parsed.phone,
      role: "EMPLOYER",
      company: {
        create: {
          name: parsed.companyName,
          inn: parsed.inn,
          email: parsed.email,
          phone: parsed.phone,
        },
      },
      notifications: {
        create: {
          title: "Создайте первую вакансию",
          message: "Активная вакансия привлекает кандидатов уже сегодня.",
        },
      },
    },
  });

  await prisma.systemLog.create({
    data: {
      action: "Регистрация работодателя",
      userEmail: user.email,
    },
  });

  redirect("/auth/login?registered=employer");
}
