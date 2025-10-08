import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

import { JobsSearchClient } from "@/app/jobs/search/search-client";
import { formatCurrency } from "@/shared/lib/utils";

jest.mock("@/shared/actions", () => ({
  createApplicationAction: jest.fn().mockResolvedValue(undefined),
}));

const { createApplicationAction } = jest.requireMock("@/shared/actions");

describe("JobsSearchClient", () => {
  const baseVacancy = {
    id: 1,
    title: "Senior React Developer",
    specialization: "Frontend",
    description: "Работа над интерфейсом", 
    requirements: "React, TypeScript",
    conditions: "Удалённая работа",
    city: "Москва",
    employmentType: "full_time",
    schedule: "remote",
    salaryFrom: 150000,
    salaryTo: 220000,
    isActive: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-11"),
    employerId: 10,
    companyId: 5,
    company: { id: 5, name: "TechCorp", inn: "123", email: "corp@tech", phone: "+7", description: "", userId: 0 },
    applications: [],
  } as const;

  const defaultFilters = {
    q: "",
    city: "",
    specialization: "",
    employmentType: "",
    schedule: "",
    salaryFrom: "",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders vacancy card with formatted data", () => {
    render(
      <JobsSearchClient
        vacancies={[baseVacancy]}
        cities={["Москва"]}
        specializations={["Frontend"]}
        applicantId={123}
        initialFilters={defaultFilters}
      />,
    );

    expect(screen.getByRole("heading", { name: "Поиск вакансий" })).toBeInTheDocument();
    expect(screen.getByText("Senior React Developer")).toBeInTheDocument();
    expect(screen.getByText(/TechCorp/)).toBeInTheDocument();
    expect(screen.getByText(`${formatCurrency(baseVacancy.salaryFrom)} — ${formatCurrency(baseVacancy.salaryTo)}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Откликнуться" })).toBeEnabled();
  });

  it("calls server action when applicant clicks apply", async () => {
    const user = userEvent.setup();
    render(
      <JobsSearchClient
        vacancies={[baseVacancy]}
        cities={["Москва"]}
        specializations={["Frontend"]}
        applicantId={321}
        initialFilters={defaultFilters}
      />,
    );

    const button = screen.getByRole("button", { name: "Откликнуться" });
    await user.click(button);

    expect(createApplicationAction).toHaveBeenCalledWith({ applicantId: 321, vacancyId: baseVacancy.id });
  });

  it("prevents applying when user is anonymous", async () => {
    const user = userEvent.setup();
    render(
      <JobsSearchClient
        vacancies={[baseVacancy]}
        cities={["Москва"]}
        specializations={["Frontend"]}
        applicantId={null}
        initialFilters={defaultFilters}
      />,
    );

    const button = screen.getByRole("button", { name: "Войдите как соискатель" });
    await user.click(button);

    expect(createApplicationAction).not.toHaveBeenCalled();
  });

  it("applies filters and pushes query to router", async () => {
    const user = userEvent.setup();
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(
      <JobsSearchClient
        vacancies={[baseVacancy]}
        cities={["Москва", "Казань"]}
        specializations={["Frontend", "Backend"]}
        applicantId={null}
        initialFilters={defaultFilters}
      />,
    );

    const citySelect = screen.getAllByLabelText("Город")[0];
    await user.selectOptions(citySelect, "Казань");

    expect(push).toHaveBeenCalledWith(expect.stringContaining("city=%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%8C"));

    const salaryInput = screen.getByLabelText("Зарплата от");
    await user.clear(salaryInput);
    await user.type(salaryInput, "180000");
    await user.tab();

    expect(push).toHaveBeenLastCalledWith(expect.stringContaining("salaryFrom=180000"));
  });
});
