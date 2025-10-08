"use client";

import { Button, Icon, Input } from "@/shared";
import { FormProvider, useForm } from "react-hook-form";
import { useActionState } from "react";
import { registerAction } from "@/app/auth/actions";
import { updateUser } from "@/shared/stores/user";
import { registerSchema, RegisterSchema } from "@/app/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const formatPhone = (value) => {
  const x = value
    .replace(/\D/g, "")
    .match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
  return !x[2]
    ? x[1]
    : "+" +
        x[1] +
        " (" +
        x[2] +
        (x[3] ? ") " + x[3] : "") +
        (x[4] ? "-" + x[4] : "") +
        (x[5] ? "-" + x[5] : "");
};

export function Register() {
  const form = useForm<RegisterSchema>();
  const router = useRouter();

  const [state, action] = useActionState(registerAction, {
    resolver: zodResolver(registerSchema),
  });

  if (state.data) {
    updateUser(state.data);
    router.push("/account");
  }
  return (
    <FormProvider {...form}>
      <form className={"mt-6 flex flex-col gap-3"} action={action}>
        <div className={"flex gap-3"}>
          <div className={"flex flex-1 flex-col gap-1"}>
            <label htmlFor={"firstName"}>Имя</label>
            <Input
              leftElement={
                <Icon name={"user"} className={"size-4 text-gray-400"} />
              }
              className={"pl-1.5"}
              name={"firstName"}
              placeholder={"Имя"}
            />
          </div>
          <div className={"flex flex-1 flex-col gap-1"}>
            <label htmlFor={"lastName"}>Фамилия</label>
            <Input
              leftElement={
                <Icon name={"user"} className={"size-4 text-gray-400"} />
              }
              className={"pl-1.5"}
              name={"lastName"}
              placeholder={"Фамилия"}
            />
          </div>
        </div>
        <div className={"flex flex-col gap-1"}>
          <label htmlFor={"email"}>Email</label>
          <Input
            leftElement={
              <Icon name={"mail"} className={"size-4 text-gray-400"} />
            }
            className={"pl-1.5"}
            name={"email"}
            placeholder={"Введите email"}
          />
        </div>
        <div className={"flex flex-col gap-1"}>
          <label htmlFor={"email"}>Телефон</label>
          <Input
            leftElement={
              <Icon name={"phone"} className={"size-4 text-gray-400"} />
            }
            className={"pl-1.5"}
            name={"phone"}
            placeholder={"+7 (000) 000-00-00"}
            onChange={(e) => {
              form.setValue("phone", formatPhone(e.target.value));
            }}
          />
        </div>
        <div className={"flex flex-col gap-1"}>
          <label htmlFor={"password"}>Пароль</label>
          <Input
            leftElement={
              <Icon name={"lock"} className={"size-4 text-gray-400"} />
            }
            className={"pl-1.5"}
            placeholder={"Создайте пароль"}
            name={"password"}
            type={"password"}
          />
        </div>
        {state.error && <p className={"text-red-500"}>{state.error}</p>}
        <Button>Регистрация</Button>
      </form>
    </FormProvider>
  );
}
