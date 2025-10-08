import { authOptions } from "@/shared/auth/options";
import { registerApplicant, registerEmployer } from "@/shared/actions";
import prisma from "@/shared/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const credentialsProvider = authOptions.providers.find((provider) => provider.id === "credentials");
const authorize = credentialsProvider?.options?.authorize;

if (!credentialsProvider || typeof authorize !== "function") {
  throw new Error("Credentials provider is not configured");
}

describe("Auth actions", () => {
  it("registers applicant with resume, notification and log", async () => {
    await registerApplicant({
      lastName: "Петров",
      firstName: "Иван",
      patronymic: "Сергеевич",
      email: "ivan.petrov@example.com",
      phone: "+7 900 123-45-67",
      password: "password123",
      desiredPosition: "QA Engineer",
    });

    const user = await prisma.user.findUnique({
      where: { email: "ivan.petrov@example.com" },
      include: { resume: true, notifications: true },
    });

    expect(user).toMatchObject({
      role: Role.APPLICANT,
      firstName: "Иван",
      lastName: "Петров",
    });
    expect(user?.resume).toMatchObject({ desiredPosition: "QA Engineer" });
    expect(user?.notifications).toHaveLength(1);
    expect(redirect).toHaveBeenCalledWith("/auth/login?registered=applicant");

    const log = await prisma.systemLog.findFirst({ where: { userEmail: "ivan.petrov@example.com" } });
    expect(log?.action).toBe("Регистрация соискателя");
  });

  it("registers employer with company and system log", async () => {
    await registerEmployer({
      companyName: "Future LLC",
      inn: "7708123456",
      email: "hr@future.ru",
      phone: "+7 921 555-44-33",
      password: "password321",
    });

    const employer = await prisma.user.findUnique({
      where: { email: "hr@future.ru" },
      include: { company: true },
    });

    expect(employer?.role).toBe(Role.EMPLOYER);
    expect(employer?.company?.name).toBe("Future LLC");
    expect(redirect).toHaveBeenCalledWith("/auth/login?registered=employer");

    const log = await prisma.systemLog.findFirst({ where: { action: "Регистрация работодателя" } });
    expect(log?.userEmail).toBe("hr@future.ru");
  });

  it("authorizes valid credentials and rejects invalid ones", async () => {
    const user = await prisma.user.create({
      data: {
        email: "qa@test.ru",
        password: "secret123",
        firstName: "QA",
        lastName: "Engineer",
        role: Role.APPLICANT,
      },
    });

    const sessionUser = await authorize({ email: user.email, password: "secret123" });
    expect(sessionUser).toMatchObject({ email: user.email, role: Role.APPLICANT });

    const invalid = await authorize({ email: user.email, password: "wrong" });
    expect(invalid).toBeNull();
  });

  it("adds role and id into session callback", async () => {
    const session = await authOptions.callbacks?.session?.({
      session: { user: { name: "QA", email: "qa@test.ru" } } as never,
      token: { sub: "42", role: Role.ADMIN } as never,
    });

    expect(session?.user?.id).toBe("42");
    expect(session?.user?.role).toBe(Role.ADMIN);
  });
});
