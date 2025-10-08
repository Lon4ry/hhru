import { z } from "zod";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "Имя не может быть пустым"),
  lastName: z.string().min(1, "Фамилия не может быть пустой"),
  email: z.email("Некорректный email"),
  phone: z.string(),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;