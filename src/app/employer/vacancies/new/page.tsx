"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";

import { createVacancyAction } from "@/shared/actions";
import { Badge, Button, Card, Input, Select, Textarea } from "@/shared/ui";

const schema = z
  .object({
    title: z.string().min(3, "Укажите название вакансии"),
    description: z.string().min(20, "Добавьте описание роли"),
    requirements: z.string().min(10, "Опишите ключевые требования"),
    conditions: z.string().min(10, "Опишите условия"),
    city: z.string().min(2, "Укажите город"),
    employmentType: z.string().optional(),
    schedule: z.string().optional(),
    salaryFrom: z.coerce
      .number()
      .min(10000, "Значение должно быть больше 10 000"),
    salaryTo: z.coerce
      .number()
      .min(10000, "Значение должно быть больше 10 000"),
  })
  .refine((data) => data.salaryTo - data.salaryFrom <= 500000, {
    message: "Диапазон зарплаты слишком широкий",
    path: ["salaryTo"],
  });

const employmentOptions = [
  { label: "Полная занятость", value: "full_time" },
  { label: "Частичная занятость", value: "part_time" },
  { label: "Проектная работа", value: "project" },
  { label: "Стажировка", value: "internship" },
  { label: "Временная занятость", value: "temporary" },
];

const scheduleOptions = [
  { label: "Удалённо", value: "remote" },
  { label: "Гибрид", value: "hybrid" },
  { label: "Офис", value: "office" },
  { label: "Сменный", value: "shift" },
  { label: "Гибкий", value: "flexible" },
];

type FormValues = z.infer<typeof schema>;

export default function NewVacancyPage() {
  const { data } = useSession();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Senior Frontend-разработчик",
      description:
        "Мы ищем опытного специалиста, который возглавит развитие клиентской части продукта, построит дизайн-систему и внедрит современные практики разработки.",
      requirements:
        "5+ лет с React, глубокое знание TypeScript, опыт построения дизайн-систем.",
      conditions: "Оформление по ТК, ДМС, бюджет на обучение, гибкий график.",
      city: "Москва",
      employmentType: "full_time",
      schedule: "hybrid",
      salaryFrom: 180000,
      salaryTo: 260000,
    },
  });

  const onSubmit = (values: FormValues) => {
    const employerId = Number(data?.user?.id ?? 0);
    if (!employerId) return;
    startTransition(async () => {
      await createVacancyAction({
        employerId,
        ...values,
      });
    });
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Новая вакансия
        </h1>
        <p className="text-sm text-slate-500">
          Заполните форму, проверьте значения зарплаты и требования — система
          покажет валидационные подсказки в реальном времени.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-900">Пример:</span>{" "}
            укажите «от {form.watch("salaryFrom")?.toLocaleString("ru-RU")}₽ до{" "}
            {form.watch("salaryTo")?.toLocaleString("ru-RU")} ₽» — форма
            проверит, чтобы верхняя граница была выше нижней и диапазон не
            превышал 500 000 ₽.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Input
            label="Должность"
            {...form.register("title")}
            error={form.formState.errors.title?.message}
          />
          <Textarea
            label="Описание"
            {...form.register("description")}
            error={form.formState.errors.description?.message}
          />
          <Textarea
            label="Требования"
            {...form.register("requirements")}
            error={form.formState.errors.requirements?.message}
          />
          <Textarea
            label="Условия"
            {...form.register("conditions")}
            error={form.formState.errors.conditions?.message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Город"
              {...form.register("city")}
              error={form.formState.errors.city?.message}
            />
            <Select
              label="Тип занятости"
              options={employmentOptions}
              value={form.watch("employmentType")}
              onChange={(event) =>
                form.setValue("employmentType", event.target.value)
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="График"
              options={scheduleOptions}
              value={form.watch("schedule")}
              onChange={(event) =>
                form.setValue("schedule", event.target.value)
              }
            />
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="neutral">Пример: 180 000 ₽ → 260 000 ₽</Badge>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Зарплата от"
              type="number"
              {...form.register("salaryFrom", { valueAsNumber: true })}
              error={form.formState.errors.salaryFrom?.message}
            />
            <Input
              label="Зарплата до"
              type="number"
              {...form.register("salaryTo", { valueAsNumber: true })}
              error={form.formState.errors.salaryTo?.message}
            />
          </div>
          <Button type="submit" size="lg" loading={isPending}>
            Опубликовать вакансию
          </Button>
        </form>
      </Card>
    </div>
  );
}
