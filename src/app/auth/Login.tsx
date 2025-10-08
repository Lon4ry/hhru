"use client";

import { Button, Icon, Input } from "@/shared";
import { FormProvider, useForm } from "react-hook-form";
import { useActionState } from "react";
import { loginAction } from "@/app/auth/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUser } from "@/shared/stores/user";
import { useRouter } from "next/navigation";
import { loginSchema, LoginSchema } from "@/app/auth/schemas";

export function Login() {
  const form = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });
  const router = useRouter();

  const [state, action] = useActionState(loginAction, {});

  if (state.data) {
    updateUser(state.data);
    router.push("/account");
  }

  return (
    <FormProvider {...form}>
      <form className={"mt-6 flex flex-col gap-3"} action={action}>
        <div className={"flex flex-col gap-1"}>
          <label htmlFor={"email"}>Email</label>
          <Input name={"email"} placeholder={"Введите email или телефон"} />
        </div>
        <div className={"flex flex-col gap-1"}>
          <label htmlFor={"password"}>Пароль</label>
          <Input
            leftElement={
              <Icon name={"lock"} className={"size-4 text-gray-400"} />
            }
            className={"pl-1.5"}
            placeholder={"Введите пароль"}
            name={"password"}
            type={"password"}
          />
        </div>
        {state.error && <p className={"text-red-500"}>{state.error}</p>}
        <Button>Войти</Button>
      </form>
    </FormProvider>
  );
}
