import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

import { ResumesSearchClient } from "@/app/resumes/search/search-client";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@/shared/actions", () => ({
  inviteApplicantToInterview: jest.fn().mockResolvedValue(undefined),
}));

const { inviteApplicantToInterview } = jest.requireMock("@/shared/actions");

describe("ResumesSearchClient filters and actions", () => {
  const baseResume = {
    id: 11,
    userId: 55,
    desiredPosition: "Data Analyst",
    summary: "Опыт анализа данных",
    city: "Москва",
    expectedSalary: 120000,
    employmentType: "full_time",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    experience: [
      {
        id: 1,
        resumeId: 11,
        company: "FinData",
        position: "Analyst",
        description: null,
        startDate: new Date("2022-01-01"),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    education: [],
    skills: [{ skill: "SQL" }, { skill: "Python" }],
    user: { id: 55, firstName: "Мария", lastName: "Кузнецова", phone: "+7" },
  } as const;

  const initialFilters = {
    q: "",
    profession: "",
    experience: [] as (string | undefined)[],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("pushes query params when filters change", async () => {
    const user = userEvent.setup();
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(
      <ResumesSearchClient
        resumes={[baseResume]}
        employerId={null}
        initialFilters={initialFilters}
      />,
    );

    const keywordsInput = screen.getByLabelText("Ключевые слова");
    await user.type(keywordsInput, "Аналитика данных");
    const professionInput = screen.getByLabelText("Профессия");
    await user.clear(professionInput);
    await user.type(professionInput, "Product Manager");
    await user.click(screen.getByRole("checkbox", { name: "1–3 года" }));
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining("profession=Product+Manager"),
    );
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining("experience=1-3"),
    );
  });

  it("invites applicant when employer clicks CTA", async () => {
    const user = userEvent.setup();

    render(
      <ResumesSearchClient
        resumes={[baseResume]}
        employerId={42}
        initialFilters={initialFilters}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Пригласить на собеседование" }),
    );

    expect(inviteApplicantToInterview).toHaveBeenCalledWith({
      employerId: 42,
      resumeId: baseResume.id,
    });
  });

  it("disables invite button for guests", () => {
    render(
      <ResumesSearchClient
        resumes={[baseResume]}
        employerId={null}
        initialFilters={initialFilters}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Доступно работодателям" }),
    ).toBeDisabled();
  });
});
