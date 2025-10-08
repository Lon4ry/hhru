import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";
import { Badge, Button, Card, EmptyState } from "@/shared/ui";
import { formatCurrency, formatDate } from "@/shared/lib/utils";

export default async function EmployerVacanciesPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  const vacancies = await prisma.vacancy.findMany({
    where: { employerId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
    include: { applications: true, company: true },
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Мои вакансии</h1>
          <p className="text-sm text-slate-500">Создавайте вакансии и контролируйте их эффективность в реальном времени.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/employer/vacancies/new">Создать</Link>
        </Button>
      </div>

      {vacancies.length === 0 ? (
        <EmptyState title="Пока нет вакансий" description="Нажмите «Создать», чтобы опубликовать первую вакансию." />
      ) : (
        <div className="grid gap-4">
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{vacancy.title}</h2>
                  <p className="text-sm text-slate-500">
                    {vacancy.company?.name ?? "Компания"} • {vacancy.city}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatCurrency(vacancy.salaryFrom)} — {formatCurrency(vacancy.salaryTo)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={vacancy.isActive ? "success" : "warning"}>{vacancy.isActive ? "Активна" : "На паузе"}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(vacancy.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                <Badge variant="neutral">{vacancy.applications.length} откликов</Badge>
                {vacancy.employmentType && <Badge variant="neutral">Тип: {employmentLabel(vacancy.employmentType)}</Badge>}
                {vacancy.schedule && <Badge variant="neutral">График: {scheduleLabel(vacancy.schedule)}</Badge>}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function employmentLabel(value: string) {
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

function scheduleLabel(value: string) {
  switch (value) {
    case "remote":
      return "Удалённо";
    case "hybrid":
      return "Гибрид";
    case "office":
      return "Офис";
    case "shift":
      return "Сменный";
    case "flexible":
      return "Гибкий";
    default:
      return value;
  }
}
