import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";

import { UsersTable } from "./users-table";

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await getServerAuthSession();
  if (session?.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }
  const params = await searchParams;
  const where = {
    AND: [
      params.role ? { role: params.role as "APPLICANT" | "EMPLOYER" | "ADMIN" } : {},
      params.q
        ? {
            OR: [
              { email: { contains: params.q, mode: "insensitive" } },
              { firstName: { contains: params.q, mode: "insensitive" } },
              { lastName: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  } as const;

  const users = await prisma.user.findMany({
    where,
    include: {
      company: true,
      resume: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <UsersTable users={users} initialQuery={params.q ?? ""} initialRole={params.role ?? ""} />;
}
