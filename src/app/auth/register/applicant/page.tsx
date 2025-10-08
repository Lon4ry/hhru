"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerApplicant } from "@/shared/actions";
import { Button, Card, Input } from "@/shared/ui";

const schema = z.object({
  lastName: z.string().min(1, "Укажите фамилию"),
  firstName: z.string().min(1, "Укажите имя"),
  patronymic: z.string().optional(),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  password: z.string().min(6, "Минимум 6 символов"),
  desiredPosition: z.string().min(2, "Желаемая должность"),
});

type FormValues = z.infer<typeof schema>;

export default function ApplicantRegisterPage() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lastName: "",
      firstName: "",
      patronymic: "",
      email: "",
      phone: "",
      password: "",
      desiredPosition: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await registerApplicant(values);
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Регистрация соискателя</h2>
          <p className="text-sm text-slate-500">
            Создайте аккаунт, заполните резюме и начните откликаться на вакансии. Платформа автоматически создаст черновик
            резюме, который вы сможете доработать позже.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Фамилия" {...form.register("lastName")} error={form.formState.errors.lastName?.message} />
            <Input label="Имя" {...form.register("firstName")} error={form.formState.errors.firstName?.message} />
            <Input label="Отчество" {...form.register("patronymic")} error={form.formState.errors.patronymic?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Email" type="email" {...form.register("email")} error={form.formState.errors.email?.message} />
            <Input label="Телефон" {...form.register("phone")} error={form.formState.errors.phone?.message} />
          </div>
          <Input
            label="Желаемая должность"
            placeholder="Например, Продуктовый дизайнер"
            {...form.register("desiredPosition")}
            error={form.formState.errors.desiredPosition?.message}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Придумайте пароль"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Зарегистрироваться
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Уже есть аккаунт? <Link className="text-slate-900 underline" href="/auth/login">Войдите</Link>
        </p>
      </Card>
    </div>
  );
}
