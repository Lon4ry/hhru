import { PrismaClient, Role, EmploymentType, ScheduleType, ApplicationStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const employersNames = ["ТехноСофт", "Диджитал Вектор", "Инновации Плюс", "Городские Решения", "Стафф Хаб"];
const jobTitles = [
  "Разработчик",
  "Бизнес-аналитик",
  "Продуктовый менеджер",
  "UX/UI дизайнер",
  "Data Scientist",
  "DevOps инженер",
  "QA инженер",
  "Project Manager",
];
const cities = ["Москва", "Санкт-Петербург", "Екатеринбург", "Казань", "Новосибирск", "Самара", "Пермь"];
const skillsPool = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "SQL",
  "Python",
  "Figma",
  "Scrum",
  "1C",
  "Docker",
  "Kubernetes",
  "Power BI",
  "Product Discovery",
];
const conditionsPool = [
  "ДМС с первого дня",
  "Гибридный график",
  "Оплата обучения",
  "Корпоративные мероприятия",
  "Современный офис у метро",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickMany<T>(items: T[], count: number): T[] {
  const copy = [...items];
  const result: T[] = [];
  for (let i = 0; i < count; i += 1) {
    if (copy.length === 0) break;
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

async function createAdmin() {
  const password = await hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@stafftech.ru",
      password,
      firstName: "Антон",
      lastName: "Орлов",
      role: Role.ADMIN,
      notifications: {
        create: [{ title: "Добро пожаловать", message: "Вы вошли в панель администратора СтаффТехнолоджи." }],
      },
    },
  });
  await prisma.systemLog.create({ data: { action: "Создан администратор", userEmail: "admin@stafftech.ru" } });
}

async function createEmployers() {
  const employers = [];
  for (let i = 0; i < 2; i += 1) {
    const name = employersNames[i % employersNames.length];
    const email = `employer${i + 1}@stafftech.ru`;
    const password = await hash("employer123", 10);
    const employer = await prisma.user.create({
      data: {
        email,
        password,
        firstName: name,
        lastName: "",
        phone: `+7${Math.floor(1000000000 + Math.random() * 8999999999)}`,
        role: Role.EMPLOYER,
        notifications: {
          create: [{ title: "Новый день, новые кандидаты", message: "Проверьте входящие отклики." }],
        },
        company: {
          create: {
            name,
            inn: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
            email,
            phone: `+7${Math.floor(9000000000 + Math.random() * 999999999)}`,
            description: "Компания открывает новые направления и расширяет команды.",
          },
        },
      },
      include: { company: true },
    });
    employers.push(employer);
    await prisma.systemLog.create({ data: { action: `Регистрация работодателя ${name}`, userEmail: email } });
  }
  return employers;
}

async function createApplicants() {
  const applicants = [];
  const password = await hash("applicant123", 10);
  for (let i = 0; i < 30; i += 1) {
    const firstName = `Имя${i + 1}`;
    const lastName = `Фамилия${i + 1}`;
    const email = `applicant${i + 1}@stafftech.ru`;
    const desiredPosition = pick(jobTitles);
    const applicant = await prisma.user.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        phone: `+7${Math.floor(9000000000 + Math.random() * 999999999)}`,
        role: Role.APPLICANT,
        notifications: {
          create: [
            { title: "Обновите резюме", message: "Добавьте свежие навыки, чтобы повысить интерес работодателей." },
            { title: "Новые вакансии", message: "Каждый день появляются десятки актуальных предложений." },
          ],
        },
        resume: {
          create: {
            desiredPosition,
            city: pick(cities),
            expectedSalary: Math.floor(60000 + Math.random() * 200000),
            employmentType: pick(Object.values(EmploymentType)),
            summary: "Профессионал, готовый к новым вызовам и развитию.",
            skills: pickMany(skillsPool, 5),
            education: {
              create: [
                {
                  institution: "Национальный университет технологий",
                  degree: "Бакалавр",
                  field: "Информационные системы",
                  startYear: 2010 + (i % 6),
                  endYear: 2014 + (i % 6),
                },
              ],
            },
            experience: {
              create: [
                {
                  company: "Tech Solutions",
                  position: desiredPosition,
                  description: "Работа над продуктом в кросс-функциональной команде.",
                  startDate: new Date(2018, 0, 1),
                  endDate: new Date(2021, 5, 1),
                },
                {
                  company: "Innovate Labs",
                  position: desiredPosition,
                  description: "Ведение проектов и улучшение процессов разработки.",
                  startDate: new Date(2021, 6, 1),
                  endDate: null,
                },
              ],
            },
          },
        },
      },
      include: { resume: true },
    });
    applicants.push(applicant);
  }
  return applicants;
}

async function createVacancies(employers: Awaited<ReturnType<typeof createEmployers>>) {
  const vacancies = [];
  const employmentTypes = Object.values(EmploymentType);
  const schedules = Object.values(ScheduleType);
  let created = 0;
  for (const employer of employers) {
    for (let i = 0; i < 10; i += 1) {
      const title = pick(jobTitles);
      const vacancy = await prisma.vacancy.create({
        data: {
          title: `${title} ${i + 1}`,
          specialization: title,
          description: "Работа с современными технологиями и драйвовой командой.",
          requirements: "Опыт работы от 2 лет, уверенное владение инструментами из стека компании.",
          conditions: pickMany(conditionsPool, 2).join(", "),
          city: pick(cities),
          salaryFrom: Math.floor(80000 + Math.random() * 70000),
          salaryTo: Math.floor(150000 + Math.random() * 120000),
          employmentType: pick(employmentTypes),
          schedule: pick(schedules),
          employerId: employer.id,
          companyId: employer.company?.id,
        },
      });
      vacancies.push(vacancy);
      await prisma.systemLog.create({ data: { action: `Создана вакансия ${vacancy.title}`, userEmail: employer.email } });
      created += 1;
      if (created >= 20) return vacancies;
    }
  }
  return vacancies;
}

async function createApplications(
  applicants: Awaited<ReturnType<typeof createApplicants>>,
  vacancies: Awaited<ReturnType<typeof createVacancies>>,
) {
  const statuses = Object.values(ApplicationStatus);
  let created = 0;
  for (const applicant of applicants) {
    if (!applicant.resume) continue;
    const sampleVacancies = pickMany(vacancies, 3);
    for (const vacancy of sampleVacancies) {
      await prisma.application.create({
        data: {
          applicantId: applicant.id,
          vacancyId: vacancy.id,
          resumeId: applicant.resume.id,
          status: pick(statuses),
        },
      });
      created += 1;
      if (created >= 50) return;
    }
  }
}

async function seed() {
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemLog.deleteMany();

  await createAdmin();
  const employers = await createEmployers();
  const applicants = await createApplicants();
  const vacancies = await createVacancies(employers);
  await createApplications(applicants, vacancies);

  await prisma.systemLog.create({ data: { action: "Инициализация базы данных завершена" } });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
