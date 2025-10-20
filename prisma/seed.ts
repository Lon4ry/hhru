import {
  ApplicationStatus,
  EmploymentType,
  PrismaClient,
  Role,
  ScheduleType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Admin ---
  const admin = await prisma.user.create({
    data: {
      email: "admin@stafftech.ru",
      password: "1234",
      firstName: "Администратор",
      lastName: "Системы",
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: "applicant@stafftech.ru",
      password: "123",
      firstName: "Тест",
      lastName: "Пользователь",
      role: Role.APPLICANT,
    },
  });

  await prisma.user.create({
    data: {
      email: "hr@stafftech.ru",
      password: "123",
      firstName: "Тест",
      lastName: "Работодатель",
      role: Role.EMPLOYER,
    },
  });

  // --- Employers & Companies ---
  const employer1 = await prisma.user.create({
    data: {
      email: "hr@techcorp.ru",
      password: "password123",
      firstName: "Анна",
      lastName: "Петрова",
      role: Role.EMPLOYER,
      phone: "+7 (999) 123-45-67",
      company: {
        create: {
          name: "TechCorp",
          inn: "7701234567",
          email: "contact@techcorp.ru",
          phone: "+7 (999) 111-22-33",
          description:
            "IT-компания, специализирующаяся на разработке корпоративных систем",
        },
      },
    },
    include: { company: true },
  });

  const employer2 = await prisma.user.create({
    data: {
      email: "jobs@finlogic.ru",
      password: "password123",
      firstName: "Сергей",
      lastName: "Иванов",
      role: Role.EMPLOYER,
      company: {
        create: {
          name: "FinLogic",
          inn: "7723456789",
          email: "info@finlogic.ru",
          phone: "+7 (999) 222-33-44",
          description: "Финансовые решения и консалтинг",
        },
      },
    },
    include: { company: true },
  });

  // --- Vacancies ---
  const vacancy1 = await prisma.vacancy.create({
    data: {
      title: "Frontend Developer",
      specialization: "Web Development",
      description: "Разработка интерфейсов на React",
      requirements: "React, TypeScript, TailwindCSS",
      conditions: "Удалённо, график гибкий",
      city: "Москва",
      employmentType: EmploymentType.full_time,
      schedule: ScheduleType.remote,
      salaryFrom: 120000,
      salaryTo: 180000,
      employerId: employer1.id,
      companyId: employer1.company?.id,
    },
  });

  const vacancy2 = await prisma.vacancy.create({
    data: {
      title: "Data Analyst",
      specialization: "Analytics",
      description: "Работа с BI-инструментами и SQL",
      requirements: "SQL, PowerBI, Python",
      conditions: "Офис, гибкий график",
      city: "Санкт-Петербург",
      employmentType: EmploymentType.full_time,
      schedule: ScheduleType.hybrid,
      salaryFrom: 90000,
      salaryTo: 130000,
      employerId: employer2.id,
      companyId: employer2.company?.id,
    },
  });

  // --- Applicants & Resumes ---
  const applicant1 = await prisma.user.create({
    data: {
      email: "alex@example.com",
      password: "test123",
      firstName: "Алексей",
      lastName: "Николаев",
      patronymic: "Игоревич",
      role: Role.APPLICANT,
      resume: {
        create: {
          desiredPosition: "Frontend Developer",
          summary: "Опыт работы с React, Next.js, TailwindCSS",
          city: "Москва",
          expectedSalary: 150000,
          employmentType: EmploymentType.full_time,
          education: {
            create: [
              {
                institution: "МГТУ им. Баумана",
                degree: "Бакалавр",
                field: "Информатика и вычислительная техника",
                startYear: 2017,
                endYear: 2021,
              },
            ],
          },
          experience: {
            create: [
              {
                company: "WebDev Studio",
                position: "Junior Frontend Developer",
                description: "Разработка SPA-приложений на React",
                startDate: new Date("2021-07-01"),
                endDate: new Date("2023-02-01"),
              },
            ],
          },
          skills: {
            create: [
              { skill: "React" },
              { skill: "TypeScript" },
              { skill: "TailwindCSS" },
            ],
          },
        },
      },
    },
    include: { resume: true },
  });

  const applicant2 = await prisma.user.create({
    data: {
      email: "maria@example.com",
      password: "test123",
      firstName: "Мария",
      lastName: "Кузнецова",
      role: Role.APPLICANT,
      resume: {
        create: {
          desiredPosition: "Data Analyst",
          summary: "Опыт анализа данных и визуализации",
          city: "Санкт-Петербург",
          expectedSalary: 100000,
          employmentType: EmploymentType.full_time,
          education: {
            create: [
              {
                institution: "СПбГУ",
                degree: "Магистр",
                field: "Прикладная математика",
                startYear: 2015,
                endYear: 2021,
              },
            ],
          },
          experience: {
            create: [
              {
                company: "FinData",
                position: "Data Analyst",
                description: "Построение отчётов и визуализаций",
                startDate: new Date("2021-01-01"),
                endDate: new Date("2023-01-01"),
              },
            ],
          },
          skills: {
            create: [
              { skill: "SQL" },
              { skill: "PowerBI" },
              { skill: "Python" },
            ],
          },
        },
      },
    },
    include: { resume: true },
  });

  const applicant3 = await prisma.user.create({
    data: {
      email: "ivan@example.com",
      password: "test123",
      firstName: "Иван",
      lastName: "Соколов",
      role: Role.APPLICANT,
      resume: {
        create: {
          desiredPosition: "Project Manager",
          city: "Москва",
          expectedSalary: 180000,
          employmentType: EmploymentType.full_time,
          summary: "Опыт управления IT-проектами более 5 лет",
          education: {
            create: [
              {
                institution: "ВШЭ",
                degree: "Магистр менеджмента",
                startYear: 2012,
                endYear: 2018,
              },
            ],
          },
          skills: {
            create: [
              { skill: "Agile" },
              { skill: "Scrum" },
              { skill: "Kanban" },
            ],
          },
        },
      },
    },
  });

  // --- Applications ---
  await prisma.application.createMany({
    data: [
      {
        applicantId: applicant1.id,
        vacancyId: vacancy1.id,
        resumeId: applicant1.resume?.id,
        status: ApplicationStatus.pending,
      },
      {
        applicantId: applicant2.id,
        vacancyId: vacancy2.id,
        resumeId: applicant2.resume?.id,
        status: ApplicationStatus.invited,
      },
      {
        applicantId: applicant3.id,
        vacancyId: vacancy2.id,
        status: ApplicationStatus.rejected,
      },
    ],
  });

  // --- Notifications ---
  await prisma.notification.createMany({
    data: [
      {
        title: "Новое приглашение на собеседование",
        message:
          "Работодатель FinLogic пригласил вас на интервью по вакансии Data Analyst.",
        userId: applicant2.id,
      },
      {
        title: "Новый отклик на вакансию",
        message:
          "Поступил отклик от Алексея Николаева на вакансию Frontend Developer.",
        userId: employer1.id,
      },
    ],
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
