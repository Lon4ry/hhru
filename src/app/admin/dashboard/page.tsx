import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";
import { Card, StatsCard } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

async function getAdminData() {
  const [userCount, activeVacancies, hiredCount, logs] = await Promise.all([
    prisma.user.count(),
    prisma.vacancy.count({ where: { isActive: true } }),
    prisma.application.count({ where: { status: "hired" } }),
    prisma.systemLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return { userCount, activeVacancies, hiredCount, logs };
}

export default async function AdminDashboardPage() {
  const session = await getServerAuthSession();
  if (session?.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const { userCount, activeVacancies, hiredCount, logs } = await getAdminData();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Всего пользователей" value={userCount} description="Соискатели, работодатели и администраторы" />
        <StatsCard title="Активные вакансии" value={activeVacancies} description="Мониторинг опубликованных позиций" />
        <StatsCard title="Трудоустроено" value={hiredCount} description="Статистика подтверждённых офферов" />
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Системный журнал</h2>
          <p className="text-sm text-slate-500">Отслеживайте ключевые действия пользователей на платформе.</p>
        </div>
        <div className="grid gap-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{log.action}</span>
                <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-500">{log.userEmail ?? "—"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
