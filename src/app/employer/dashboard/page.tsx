import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";
import { Badge, Button, Card, EmptyState, StatsCard } from "@/shared/ui";
import { formatCurrency, formatDate } from "@/shared/lib/utils";

import { ApplicationStatusControls } from "./application-status-controls";

async function getEmployerData(userId: number) {
  const [vacancies, applications, notifications] = await Promise.all([
    prisma.vacancy.findMany({
      where: { employerId: userId },
      include: { applications: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.application.findMany({
      where: { vacancy: { employerId: userId } },
      include: {
        applicant: true,
        vacancy: true,
        resume: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return { vacancies, applications, notifications };
}

export default async function EmployerDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  const userId = Number(session.user.id);
  const { vacancies, applications, notifications } =
    await getEmployerData(userId);

  const activeVacancies = vacancies.filter(
    (vacancy) => vacancy.isActive,
  ).length;
  const newApplications = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const invited = applications.filter(
    (application) => application.status === "invited",
  ).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Активные вакансии"
          value={activeVacancies}
          description="Управляйте статусами и публикациями"
        />
        <StatsCard
          title="Новые отклики"
          value={newApplications}
          description="Проверяйте заявки ежедневно"
        />
        <StatsCard
          title="Запланировано собеседований"
          value={invited}
          description="Поддерживайте коммуникацию"
        />
      </div>

      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Создание вакансий
          </h2>
          <p className="text-sm text-slate-500">
            Публикуйте новые предложения, чтобы быстрее находить кандидатов.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          <Button asChild size="lg">
            <Link href="/employer/vacancies/new">Создать вакансию</Link>
          </Button>
          <Link
            href="/employer/vacancies"
            className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
          >
            Перейти к списку
          </Link>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Уведомления</h2>
          <p className="text-sm text-slate-500">
            Система подсказывает, когда появилось что-то важное.
          </p>
        </div>
        {notifications.length === 0 ? (
          <EmptyState
            title="Новых уведомлений нет"
            description="Создайте вакансию, чтобы получить первые отклики."
          />
        ) : (
          <ul className="grid gap-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {notification.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Свежие отклики
            </h2>
            <p className="text-sm text-slate-500">
              Команда ждёт вашей обратной связи.
            </p>
          </div>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            title="Откликов пока нет"
            description="Активируйте вакансии или обновите требования."
          />
        ) : (
          <div className="grid gap-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {application.resume?.desiredPosition}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {application.applicant.lastName}{" "}
                      {application.applicant.firstName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={
                        application.status === "invited"
                          ? "success"
                          : application.status === "rejected"
                            ? "danger"
                            : application.status === "hired"
                              ? "success"
                              : "neutral"
                      }
                    >
                      {application.status === "pending"
                        ? "На рассмотрении"
                        : application.status === "invited"
                          ? "Приглашён"
                          : application.status === "rejected"
                            ? "Отказ"
                            : "Трудоустроен"}
                    </Badge>
                    <ApplicationStatusControls
                      applicationId={application.id}
                      currentStatus={application.status}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Вакансии компании
            </h2>
            <p className="text-sm text-slate-500">
              Короткое резюме по свежим предложениям.
            </p>
          </div>
        </div>
        {vacancies.length === 0 ? (
          <EmptyState
            title="Нет вакансий"
            description="Создайте первую вакансию, чтобы привлечь кандидатов."
          />
        ) : (
          <div className="grid gap-3">
            {vacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {vacancy.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {vacancy.city} • {vacancy.applications.length} откликов
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(vacancy.salaryFrom)} —{" "}
                      {formatCurrency(vacancy.salaryTo)}
                    </p>
                  </div>
                  <Badge variant={vacancy.isActive ? "success" : "warning"}>
                    {vacancy.isActive ? "Активна" : "На паузе"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
