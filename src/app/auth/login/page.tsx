"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button, Card, ErrorBanner, Input } from "@/shared/ui";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const registered = params.get("registered");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const response = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    if (response?.error) {
      setError("Неверный email или пароль");
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Вход в систему</h2>
          <p className="text-sm text-slate-500">
            Авторизуйтесь, чтобы управлять вакансиями, откликами и статистикой на платформе «СтаффТехнолоджи».
          </p>
        </div>
        {registered === "applicant" && (
          <ErrorBanner message="Регистрация успешно завершена. Войдите, чтобы продолжить." />
        )}
        {registered === "employer" && (
          <ErrorBanner message="Компания зарегистрирована. Войдите, чтобы создать первую вакансию." />
        )}
        {error && <ErrorBanner message={error} />}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="name@company.ru"
            {...form.register("email")}
            error={form.formState.errors.email?.message}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
            Войти
          </Button>
        </form>
        <div className="space-y-2 text-center text-sm text-slate-500">
          <p>
            Нет аккаунта? <Link className="text-slate-900 underline" href="/auth/register/applicant">Регистрация соискателя</Link>
          </p>
          <p>
            Представляете компанию? <Link className="text-slate-900 underline" href="/auth/register/employer">Регистрация работодателя</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
