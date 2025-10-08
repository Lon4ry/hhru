"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerEmployer } from "@/shared/actions";
import { Button, Card, Input } from "@/shared/ui";

const schema = z.object({
  companyName: z.string().min(2, "Введите название компании"),
  inn: z.string().min(10, "ИНН должен содержать минимум 10 цифр"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormValues = z.infer<typeof schema>;

export default function EmployerRegisterPage() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      inn: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await registerEmployer(values);
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            Регистрация работодателя
          </h2>
          <p className="text-sm text-slate-500">
            После регистрации вы сможете создать карточку компании, публиковать
            вакансии и отслеживать отклики кандидатов в режиме реального
            времени.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Input
            label="Название компании"
            {...form.register("companyName")}
            error={form.formState.errors.companyName?.message}
          />
          <Input
            label="ИНН"
            {...form.register("inn")}
            error={form.formState.errors.inn?.message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              {...form.register("email")}
              error={form.formState.errors.email?.message}
            />
            <Input
              label="Телефон"
              {...form.register("phone")}
              error={form.formState.errors.phone?.message}
            />
          </div>
          <Input
            label="Пароль"
            type="password"
            placeholder="Придумайте пароль"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Зарегистрировать компанию
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Уже работаете с нами?{" "}
          <Link className="text-slate-900 underline" href="/auth/login">
            Войдите
          </Link>
        </p>
      </Card>
    </div>
  );
}
