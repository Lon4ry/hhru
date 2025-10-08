import Link from "next/link";

import prisma from "@/shared/prisma";
import { Button, Card, StatsCard } from "@/shared/ui";
import { formatCurrency } from "@/shared/lib/utils";

async function getLandingStats() {
  const [vacancyCount, resumeCount, hiredCount, avgSalary] = await Promise.all([
    prisma.vacancy.count({ where: { isActive: true } }),
    prisma.resume.count(),
    prisma.application.count({ where: { status: "hired" } }),
    prisma.vacancy.aggregate({ _avg: { salaryTo: true } }),
  ]);

  return {
    vacancyCount,
    resumeCount,
    hiredCount,
    avgSalary: avgSalary._avg.salaryTo ?? 0,
  };
}

export default async function LandingPage() {
  const stats = await getLandingStats();

  return (
    <section className="grid gap-10">
      <div className="grid items-center gap-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-800 px-10 py-14 text-white">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-wider">
            HR-платформа «СтаффТехнолоджи»
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Технологичный найм: соединяем лучших специалистов с амбициозными компаниями
          </h1>
          <p className="text-lg text-white/80">
            Публикуйте вакансии, управляйте откликами и отслеживайте аналитику — всё в одной экосистеме для соискателей,
            работодателей и администраторов.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/jobs/search">Найти работу</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border border-white/30 text-white hover:bg-white/10">
              <Link href="/auth/register/employer">Найти сотрудника</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Активных вакансий" value={stats.vacancyCount} description="Работодатели ищут специалистов прямо сейчас" />
        <StatsCard title="Резюме в базе" value={stats.resumeCount} description="Проверенные специалисты готовы к диалогу" />
        <StatsCard
          title="Трудоустроено кандидатов"
          value={stats.hiredCount}
          description={`Средняя зарплата по предложениям — ${formatCurrency(stats.avgSalary)}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Единый профиль",
            description:
              "Соискатель заполняет резюме однажды и откликается на вакансии в один клик. Работодатели получают структурированные данные.",
          },
          {
            title: "Аналитика для бизнеса",
            description:
              "Дашборды показывают динамику откликов, статус собеседований и эффективность каналов привлечения кандидатов.",
          },
          {
            title: "Безопасность",
            description:
              "Администратор следит за чистотой базы, ведёт системные логи и контролирует соблюдение регламентов платформы.",
          },
        ].map((feature) => (
          <Card key={feature.title} className="h-full space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="text-sm text-slate-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
