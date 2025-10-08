"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Vacancy, Company } from "@prisma/client";

import { createApplicationAction } from "@/shared/actions";
import { Badge, Button, Card, EmptyState, FiltersSheet, Input, Select, Skeleton } from "@/shared/ui";
import { formatCurrency, formatDate } from "@/shared/lib/utils";

interface JobsSearchClientProps {
  vacancies: (Vacancy & { company: Company | null })[];
  cities: string[];
  specializations: string[];
  applicantId: number | null;
  initialFilters: { q: string; city: string; specialization: string; employmentType: string; schedule: string; salaryFrom: string };
}

const employmentOptions = [
  { label: "Тип занятости", value: "" },
  { label: "Полная", value: "full_time" },
  { label: "Частичная", value: "part_time" },
  { label: "Проект", value: "project" },
  { label: "Стажировка", value: "internship" },
  { label: "Временная", value: "temporary" },
];

const scheduleOptions = [
  { label: "График", value: "" },
  { label: "Удалённо", value: "remote" },
  { label: "Гибрид", value: "hybrid" },
  { label: "Офис", value: "office" },
  { label: "Сменный", value: "shift" },
  { label: "Гибкий", value: "flexible" },
];

export function JobsSearchClient({ vacancies, cities, specializations, applicantId, initialFilters }: JobsSearchClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const applyFilters = (values: Partial<typeof initialFilters>) => {
    const params = new URLSearchParams();
    const nextFilters = { ...initialFilters, ...values };
    if (nextFilters.q) params.set("q", nextFilters.q);
    if (nextFilters.city) params.set("city", nextFilters.city);
    if (nextFilters.specialization) params.set("specialization", nextFilters.specialization);
    if (nextFilters.employmentType) params.set("employmentType", nextFilters.employmentType);
    if (nextFilters.schedule) params.set("schedule", nextFilters.schedule);
    if (nextFilters.salaryFrom) params.set("salaryFrom", nextFilters.salaryFrom);
    router.push(`/jobs/search?${params.toString()}`);
  };

  const handleApply = (vacancyId: number) => {
    if (!applicantId) return;
    startTransition(async () => {
      await createApplicationAction({ applicantId, vacancyId });
    });
  };

  const filterForm = (
    <div className="grid gap-3">
      <Input
        label="Поиск по вакансиям"
        defaultValue={initialFilters.q}
        placeholder="Должность или технология"
        onBlur={(event) => applyFilters({ q: event.target.value })}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Город"
          options={[{ label: "Все города", value: "" }, ...cities.map((city) => ({ label: city, value: city }))]}
          value={initialFilters.city}
          onChange={(event) => applyFilters({ city: event.target.value })}
        />
        <Select
          label="Специализация"
          options={[{ label: "Все специализации", value: "" }, ...specializations.map((item) => ({ label: item, value: item }))]}
          value={initialFilters.specialization}
          onChange={(event) => applyFilters({ specialization: event.target.value })}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Тип занятости"
          options={employmentOptions}
          value={initialFilters.employmentType}
          onChange={(event) => applyFilters({ employmentType: event.target.value })}
        />
        <Select
          label="График"
          options={scheduleOptions}
          value={initialFilters.schedule}
          onChange={(event) => applyFilters({ schedule: event.target.value })}
        />
      </div>
      <Input
        label="Зарплата от"
        type="number"
        defaultValue={initialFilters.salaryFrom}
        placeholder="Например, 120000"
        onBlur={(event) => applyFilters({ salaryFrom: event.target.value })}
      />
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <aside className="hidden md:block">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Фильтры</h2>
          {filterForm}
        </Card>
      </aside>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Поиск вакансий</h1>
            <p className="text-sm text-slate-500">Найдите подходящую позицию и откликнитесь за пару кликов.</p>
          </div>
          <FiltersSheet title="Фильтры вакансий">{filterForm}</FiltersSheet>
        </div>
        {vacancies.length === 0 ? (
          <EmptyState title="Вакансий не найдено" description="Попробуйте изменить условия поиска." />
        ) : (
          <div className="grid gap-4">
            {vacancies.map((vacancy) => (
              <Card key={vacancy.id} className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{vacancy.title}</h2>
                    <p className="text-sm text-slate-500">
                      {(vacancy.company?.name ?? "Компания") + " • " + vacancy.city}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(vacancy.salaryFrom)} — {formatCurrency(vacancy.salaryTo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {vacancy.specialization && <Badge variant="neutral">{vacancy.specialization}</Badge>}
                    {vacancy.employmentType && <Badge variant="neutral">{translateEmployment(vacancy.employmentType)}</Badge>}
                    <span className="text-xs text-slate-400">{formatDate(vacancy.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{vacancy.description}</p>
                <div className="grid gap-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Требования:</span> {vacancy.requirements}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Условия:</span> {vacancy.conditions}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    disabled={!applicantId}
                    loading={isPending}
                    onClick={() => handleApply(vacancy.id)}
                    className="md:w-auto"
                  >
                    {applicantId ? "Откликнуться" : "Войдите как соискатель"}
                  </Button>
                  {isPending && <Skeleton className="h-2 w-32" />}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function translateEmployment(value: string) {
  switch (value) {
    case "full_time":
      return "Полная";
    case "part_time":
      return "Частичная";
    case "project":
      return "Проект";
    case "internship":
      return "Стажировка";
    case "temporary":
      return "Временная";
    default:
      return value;
  }
}
