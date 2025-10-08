"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Education, Experience, Resume, User } from "@prisma/client";

import { inviteApplicantToInterview } from "@/shared/actions";
import { Badge, Button, Card, ChipInput, EmptyState, FiltersSheet, Input, Skeleton } from "@/shared/ui";
import { formatCurrency, formatDate } from "@/shared/lib/utils";

interface ResumeWithRelations extends Resume {
  experience: Experience[];
  education: Education[];
  user: Pick<User, "id" | "firstName" | "lastName" | "phone">;
  skills: {
    skill: string;
  }[]
}

interface ResumesSearchClientProps {
  resumes: ResumeWithRelations[];
  employerId: number | null;
  initialFilters: { q: string; profession: string; experience: (string | undefined)[] };
}

const experienceOptions = [
  { label: "Нет опыта", value: "0-1" },
  { label: "1–3 года", value: "1-3" },
  { label: "3–5 лет", value: "3-5" },
  { label: "5+ лет", value: "5+" },
];

export function ResumesSearchClient({ resumes, employerId, initialFilters }: ResumesSearchClientProps) {
  const router = useRouter();
  const [keywords, setKeywords] = useState(initialFilters.q ? [initialFilters.q] : []);
  const [profession, setProfession] = useState(initialFilters.profession);
  const [experience, setExperience] = useState<string[]>(initialFilters.experience.filter(Boolean) as string[]);
  const [isPending, startTransition] = useTransition();

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (keywords.length > 0) params.set("q", keywords.join(" "));
    if (profession) params.set("profession", profession);
    experience.forEach((value) => params.append("experience", value));
    const query = params.toString();
    router.push(query ? `/resumes/search?${query}` : "/resumes/search");
  };

  const invite = (resumeId: number) => {
    if (!employerId) return;
    startTransition(async () => {
      await inviteApplicantToInterview({ employerId, resumeId });
    });
  };

  const filterPanel = (
    <div className="grid gap-4">
      <ChipInput label="Ключевые слова" value={keywords} onChange={setKeywords} placeholder="Например, React, аналитика" />
      <Input
        label="Профессия"
        placeholder="Например, Аналитик данных"
        value={profession}
        onChange={(event) => setProfession(event.target.value)}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">Опыт работы</p>
        <div className="grid gap-2">
          {experienceOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={experience.includes(option.value)}
                onChange={(event) => {
                  setExperience((prev) =>
                    event.target.checked ? [...prev, option.value] : prev.filter((value) => value !== option.value),
                  );
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <Button onClick={applyFilters}>Сохранить</Button>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <aside className="hidden md:block">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Фильтры резюме</h2>
          {filterPanel}
        </Card>
      </aside>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Поиск резюме</h1>
            <p className="text-sm text-slate-500">Изучайте профили и приглашайте кандидатов на интервью.</p>
          </div>
          <FiltersSheet title="Настройки фильтрации" triggerLabel="Фильтры">
            {filterPanel}
          </FiltersSheet>
        </div>
        {resumes.length === 0 ? (
          <EmptyState title="Резюме не найдены" description="Попробуйте расширить запрос или уберите ограничения по опыту." />
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{resume.desiredPosition}</h2>
                    <p className="text-sm text-slate-500">
                      Опыт {formatExperienceYears(resume.experience)} • {resume.city ?? "Город не указан"}
                    </p>
                    <p className="text-sm text-slate-500">{formatCurrency(resume.expectedSalary)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.slice(0, 6).map(({skill}) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                {resume.summary && <p className="text-sm text-slate-600">{resume.summary}</p>}
                <div className="grid gap-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Последние места работы</p>
                  {resume.experience.slice(0, 2).map((item) => (
                    <p key={item.id}>
                      {item.company} • {item.position} ({formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : "по наст. время"})
                    </p>
                  ))}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button disabled={!employerId} loading={isPending} onClick={() => invite(resume.id)}>
                    {employerId ? "Пригласить на собеседование" : "Доступно работодателям"}
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

function formatExperienceYears(experience: Experience[]) {
  if (experience.length === 0) return "нет опыта";
  const years = experience.reduce((acc, item) => {
    if (!item.startDate) return acc;
    const start = new Date(item.startDate);
    const end = item.endDate ? new Date(item.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return acc + Math.max(months, 0);
  }, 0);
  const totalYears = Math.max(Math.round(years / 12), 0);
  return `${totalYears} лет`;
}
