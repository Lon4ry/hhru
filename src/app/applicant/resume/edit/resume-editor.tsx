"use client";

import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Education, Experience, Resume } from "@prisma/client";

import { saveResumeAction } from "@/shared/actions";
import { Button, Card, ChipInput, Input, Select } from "@/shared/ui";

const employmentOptions = [
  { label: "Полная занятость", value: "full_time" },
  { label: "Частичная занятость", value: "part_time" },
  { label: "Проектная работа", value: "project" },
  { label: "Стажировка", value: "internship" },
  { label: "Временная занятость", value: "temporary" },
];

const schema = z.object({
  resumeId: z.number(),
  desiredPosition: z.string().min(2, "Укажите должность"),
  city: z.string().min(2, "Укажите город"),
  summary: z.string().optional(),
  expectedSalary: z.string().optional(),
  employmentType: z.string().optional(),
  skills: z.array(z.string().min(1)).min(1, "Добавьте хотя бы один навык"),
  education: z
    .array(
      z.object({
        institution: z.string().min(2, "Укажите учебное заведение"),
        degree: z.string().optional(),
        field: z.string().optional(),
        startYear: z.string().optional(),
        endYear: z.string().optional(),
      }),
    )
    .min(1, "Добавьте хотя бы одну запись"),
  experience: z.array(
    z.object({
      company: z.string().min(2, "Укажите компанию"),
      position: z.string().min(2, "Укажите должность"),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

interface ResumeEditorProps {
  resume: Resume & { education: Education[]; experience: Experience[] };
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      resumeId: resume.id,
      desiredPosition: resume.desiredPosition,
      city: resume.city ?? "",
      summary: resume.summary ?? "",
      expectedSalary: resume.expectedSalary ? String(resume.expectedSalary) : "",
      employmentType: resume.employmentType ?? "",
      skills: resume.skills.length ? resume.skills : ["Коммуникация"],
      education: resume.education.length
        ? resume.education.map((item) => ({
            institution: item.institution,
            degree: item.degree ?? "",
            field: item.field ?? "",
            startYear: item.startYear ? String(item.startYear) : "",
            endYear: item.endYear ? String(item.endYear) : "",
          }))
        : [
            {
              institution: "",
              degree: "",
              field: "",
              startYear: "",
              endYear: "",
            },
          ],
      experience: resume.experience.length
        ? resume.experience.map((item) => ({
            company: item.company,
            position: item.position,
            description: item.description ?? "",
            startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "",
            endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "",
          }))
        : [
            { company: "", position: "", description: "", startDate: "", endDate: "" },
          ],
    },
  });

  const educationArray = useFieldArray({ control: form.control, name: "education" });
  const experienceArray = useFieldArray({ control: form.control, name: "experience" });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await saveResumeAction({
        ...values,
        expectedSalary: values.expectedSalary ? Number(values.expectedSalary) : undefined,
        employmentType: values.employmentType || undefined,
        skills: values.skills.filter(Boolean),
      });
    });
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Редактор резюме</h1>
        <p className="text-sm text-slate-500">
          Обновляйте образование, навыки и опыт, чтобы работодатели видели актуальную информацию.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Основные данные</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Желаемая должность"
              {...form.register("desiredPosition")}
              error={form.formState.errors.desiredPosition?.message}
            />
            <Input label="Город" {...form.register("city")} error={form.formState.errors.city?.message} />
          </div>
          <Input
            label="О себе"
            placeholder="Опишите, чем вы можете быть полезны"
            {...form.register("summary")}
            error={form.formState.errors.summary?.message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Ожидаемая зарплата"
              type="number"
              placeholder="120000"
              {...form.register("expectedSalary")}
              error={form.formState.errors.expectedSalary?.message}
            />
            <Select
              label="Тип занятости"
              options={employmentOptions}
              placeholder="Выберите вариант"
              value={form.watch("employmentType")}
              onChange={(event) => form.setValue("employmentType", event.target.value)}
              helperText="Влияет на подбор вакансий"
            />
          </div>
          <ChipInput
            label="Навыки"
            placeholder="Например, TypeScript"
            value={form.watch("skills")}
            onChange={(value) => form.setValue("skills", value)}
            error={form.formState.errors.skills?.message}
          />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Образование</h2>
              <p className="text-sm text-slate-500">Добавляйте учебные заведения, квалификации и годы обучения.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => educationArray.append({ institution: "", degree: "", field: "", startYear: "", endYear: "" })}
            >
              Добавить
            </Button>
          </div>
          <div className="grid gap-4">
            {educationArray.fields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Учебное заведение" {...form.register(`education.${index}.institution`)} />
                  <Input label="Степень" {...form.register(`education.${index}.degree`)} />
                  <Input label="Специализация" {...form.register(`education.${index}.field`)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Начало" type="number" {...form.register(`education.${index}.startYear`)} />
                    <Input label="Окончание" type="number" {...form.register(`education.${index}.endYear`)} />
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Button type="button" variant="ghost" onClick={() => educationArray.remove(index)}>
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Опыт работы</h2>
              <p className="text-sm text-slate-500">Опишите ключевые достижения и обязанности на предыдущих местах.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => experienceArray.append({ company: "", position: "", description: "", startDate: "", endDate: "" })}
            >
              Добавить опыт
            </Button>
          </div>
          <div className="grid gap-4">
            {experienceArray.fields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Компания" {...form.register(`experience.${index}.company`)} />
                  <Input label="Должность" {...form.register(`experience.${index}.position`)} />
                  <Input label="Описание" {...form.register(`experience.${index}.description`)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Начало" type="date" {...form.register(`experience.${index}.startDate`)} />
                    <Input label="Окончание" type="date" {...form.register(`experience.${index}.endDate`)} />
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Button type="button" variant="ghost" onClick={() => experienceArray.remove(index)}>
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" size="lg" loading={isPending}>
            Сохранить резюме
          </Button>
        </div>
      </form>
    </div>
  );
}
