import { test, expect } from "@playwright/test";

test.describe("Navigation and search flows", () => {
  test("navigates from landing to vacancies and shows filters", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Технологичный найм/ }),
    ).toBeVisible();

    await Promise.all([
      page.waitForURL("**/jobs/search*"),
      page.getByRole("link", { name: "Найти работу" }).click(),
    ]);

    await expect(
      page.getByRole("heading", { name: "Поиск вакансий" }),
    ).toBeVisible();
    await expect(page.getByLabel("Поиск по вакансиям")).toBeVisible();
    await expect(page.getByRole("button", { name: "Фильтры" })).toBeVisible();
    await expect(page.getByText("Frontend Developer")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Откликнуться|Войдите как соискатель/ }),
    ).toBeVisible();
  });

  test("opens resume search and renders employer actions", async ({ page }) => {
    await page.goto("/resumes/search");

    await expect(
      page.getByRole("heading", { name: "Поиск резюме" }),
    ).toBeVisible();
    await expect(page.getByText("Фильтры резюме")).toBeVisible();
    await expect(page.getByPlaceholder(/Аналитика/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Пригласить|Доступно работодателям/ }),
    ).toBeVisible();
  });
});
