import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";

import { ResumesSearchClient } from "./search-client";

interface ResumesSearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResumesSearchPage({
  searchParams,
}: ResumesSearchPageProps) {
  const session = await getServerAuthSession();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const profession =
    typeof params.profession === "string" ? params.profession : "";
  const experienceFilters = Array.isArray(params.experience)
    ? params.experience
    : params.experience
      ? [params.experience]
      : [];

  const resumes = await prisma.resume.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { desiredPosition: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { skills: { has: q } },
              ],
            }
          : {},
        profession
          ? { desiredPosition: { contains: profession, mode: "insensitive" } }
          : {},
      ],
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      experience: true,
      education: true,
      skills: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  const filteredResumes = experienceFilters.length
    ? resumes.filter((resume) => {
        const years = calculateExperienceYears(resume.experience);
        return experienceFilters.some((filter) =>
          matchExperience(filter as string, years),
        );
      })
    : resumes;

  const employerId =
    session?.user?.role === "EMPLOYER" ? Number(session.user.id) : null;

  return (
    <ResumesSearchClient
      resumes={filteredResumes}
      employerId={employerId}
      initialFilters={{
        q,
        profession,
        experience: experienceFilters,
      }}
    />
  );
}

function calculateExperienceYears(
  experience: { startDate: Date | null; endDate: Date | null }[],
) {
  if (experience.length === 0) return 0;
  const sorted = experience
    .map((item) => ({
      start: item.startDate ? new Date(item.startDate) : null,
      end: item.endDate ? new Date(item.endDate) : new Date(),
    }))
    .filter((item) => item.start);
  if (sorted.length === 0) return 0;
  const totalMonths = sorted.reduce((acc, item) => {
    const end = item.end ?? new Date();
    const start = item.start ?? new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return acc + Math.max(months, 0);
  }, 0);
  return Math.round(totalMonths / 12);
}

function matchExperience(filter: string, years: number) {
  switch (filter) {
    case "0-1":
      return years < 1;
    case "1-3":
      return years >= 1 && years < 3;
    case "3-5":
      return years >= 3 && years < 5;
    case "5+":
      return years >= 5;
    default:
      return true;
  }
}
