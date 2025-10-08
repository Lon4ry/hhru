import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";

import { JobsSearchClient } from "./search-client";

interface JobsSearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobsSearchPage({
  searchParams,
}: JobsSearchPageProps) {
  const session = await getServerAuthSession();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const city = typeof params.city === "string" ? params.city : "";
  const specialization =
    typeof params.specialization === "string" ? params.specialization : "";
  const employmentType =
    typeof params.employmentType === "string" ? params.employmentType : "";
  const schedule = typeof params.schedule === "string" ? params.schedule : "";
  const salaryFrom = params.salaryFrom ? Number(params.salaryFrom) : undefined;

  const where = {
    AND: [
      { isActive: true },
      q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { requirements: { contains: q } },
            ],
          }
        : {},
      city ? { city } : {},
      specialization ? { specialization } : {},
      employmentType ? { employmentType: employmentType as never } : {},
      schedule ? { schedule: schedule as never } : {},
      salaryFrom ? { salaryFrom: { gte: salaryFrom } } : {},
    ],
  } as const;

  const [vacancies, cities, specializations] = await Promise.all([
    prisma.vacancy.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.vacancy.findMany({
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    }),
    prisma.vacancy.findMany({
      distinct: ["specialization"],
      select: { specialization: true },
      orderBy: { specialization: "asc" },
    }),
  ]);

  const applicantId =
    session?.user?.role === "APPLICANT" ? Number(session.user.id) : null;
  const myApplications =
    session?.user?.id &&
    (await prisma.application.findMany({
      where: { resume: { userId: Number(session?.user?.id) } },
    }));

  return (
    <JobsSearchClient
      vacancies={vacancies}
      cities={cities.map((item) => item.city).filter(Boolean) as string[]}
      specializations={
        specializations
          .map((item) => item.specialization)
          .filter(Boolean) as string[]
      }
      applicantId={applicantId}
      applications={myApplications}
      initialFilters={{
        q,
        city,
        specialization,
        employmentType,
        schedule,
        salaryFrom: salaryFrom?.toString() ?? "",
      }}
    />
  );
}
