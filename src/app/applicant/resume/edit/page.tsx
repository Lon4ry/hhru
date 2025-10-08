import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";

import { ResumeEditor } from "./resume-editor";

export default async function ResumeEditPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = Number(session.user.id);
  let resume = await prisma.resume.findUnique({
    where: { userId },
    include: {
      education: true,
      experience: true,
      skills: true,
    },
  });

  if (!resume) {
    resume = await prisma.resume.create({
      data: {
        userId,
        desiredPosition: "Специалист",
        city: "",
        summary: "",
      },
      include: {
        education: true,
        experience: true,
        skills: true,
      },
    });
  }

  return <ResumeEditor resume={resume} />;
}
