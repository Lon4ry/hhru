import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";
import { Badge, Card, EmptyState, StatsCard } from "@/shared/ui";
import { formatCurrency, formatDate } from "@/shared/lib/utils";

async function getApplicantData(userId: number) {
  const [applications, notifications] = await Promise.all([
    prisma.application.findMany({
      where: { applicantId: userId },
      include: {
        vacancy: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const resume = await prisma.resume.findUnique({ where: { userId }, select: { desiredPosition: true, expectedSalary: true } });

  const statusMap = applications.reduce(
    (acc, application) => {
      acc[application.status] = (acc[application.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { applications, notifications, resume, statusMap };
}

const statusLabels: Record<string, { title: string; variant: "neutral" | "success" | "warning" | "danger" }> = {
  pending: { title: "На рассмотрении", variant: "neutral" },
  invited: { title: "Приглашение", variant: "success" },
  rejected: { title: "Отказ", variant: "danger" },
  hired: { title: "Предложение", variant: "success" },
};

export default async function ApplicantDashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = Number(session.user.id);
  const { applications, notifications, resume, statusMap } = await getApplicantData(userId);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Желаемая должность" value={resume?.desiredPosition ?? "Не указано"} />
        <StatsCard title="Ожидаемая зарплата" value={formatCurrency(resume?.expectedSalary)} />
        <StatsCard title="Всего откликов" value={applications.length} description="Следите за статусом ваших заявок" />
      </div>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Статусы откликов</h3>
        <div className="grid gap-2 md:grid-cols-4">
          {Object.entries(statusLabels).map(([key, meta]) => (
            <div key={key} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>{meta.title}</span>
                <Badge variant={meta.variant}>{statusMap[key] ?? 0}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Уведомления</h2>
          <p className="text-sm text-slate-500">Лента важных событий, приглашений и обновлений платформы.</p>
        </div>
        {notifications.length === 0 ? (
          <EmptyState title="Пока нет уведомлений" description="Откликайтесь на вакансии, чтобы получать приглашения." />
        ) : (
          <ul className="grid gap-3">
            {notifications.map((notification) => (
              <li key={notification.id} className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{notification.title}</h3>
                  <span className="text-xs text-slate-400">{formatDate(notification.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Исходящие отклики</h2>
          <p className="text-sm text-slate-500">Отслеживайте статус заявок и приглашений от работодателей.</p>
        </div>
        {applications.length === 0 ? (
          <EmptyState title="Вы ещё не откликались" description="Перейдите в раздел вакансий и отправьте первый отклик." />
        ) : (
          <div className="grid gap-3">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{application.vacancy.title}</h3>
                    <p className="text-sm text-slate-500">
                      {application.vacancy.company?.name ?? "Компания"} • {application.vacancy.city}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(application.vacancy.salaryFrom)} — {formatCurrency(application.vacancy.salaryTo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusLabels[application.status]?.variant ?? "neutral"}>
                      {statusLabels[application.status]?.title ?? application.status}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatDate(application.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
