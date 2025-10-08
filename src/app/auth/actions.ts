"use server";

import prisma, { User } from "@/shared/prisma";
import { loginSchema, registerSchema } from "@/app/auth/schemas";

export async function loginAction(
  _: { data?: Omit<User, "password">; error?: string },
  formData: FormData,
): Promise<{ data?: Omit<User, "password">; error?: string }> {
  const data = loginSchema.parse(Object.fromEntries(formData.entries()));
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email, password: data.password },
        { phone: data.email, password: data.password },
      ],
    },
  });
  if (!user) {
    return { error: "Неправильный логин или пароль" };
  }

  const { password, ...rest } = user;
  return { data: rest };
}

export async function registerAction(
  _: { data?: Omit<User, "password">; error?: string },
  formData: FormData,
): Promise<{ data?: Omit<User, "password">; error?: string }> {
  const data = registerSchema.parse(Object.fromEntries(formData.entries()));

  try {
    const user = await prisma.user.create({ data: { ...data, role: "user" } });
    const { password, ...rest } = user;
    return { data: rest };
  } catch (error) {
    console.log(error);
    return { error: "Ошибка при регистрации" };
  }
}
