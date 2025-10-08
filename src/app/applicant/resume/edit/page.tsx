import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/shared/auth/session";
import prisma from "@/shared/prisma";

import { ResumeEditor } from "./resume-editor";

export default async function ResumeEditPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  const resume = await prisma.resume.findUnique({
    where: { userId: Number(session.user.id) },
    include: {
      education: true,
      experience: true,
    },
  });

  if (!resume) {
    redirect("/applicant/dashboard");
  }

  return <ResumeEditor resume={resume} />;
}
