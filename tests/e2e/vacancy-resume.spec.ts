import { test, expect } from "@playwright/test";

async function login(page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL("**/"),
    page.click('button[type="submit"]'),
  ]);
}

test.describe("Employer and applicant flows", () => {
  test("employer publishes a new vacancy", async ({ page }) => {
    await login(page, "hr@techcorp.ru", "password123");

    await page.goto("/employer/vacancies/new");
    const title = `QA Lead ${Date.now()}`;

    await page.fill('input[name="title"]', title);
    await page.fill(
      'textarea[name="description"]',
      "Отвечать за качество, автоматизацию и улучшение процессов.",
    );
    await page.fill(
      'textarea[name="requirements"]',
      "5+ лет опыта, знание Playwright, TypeScript, CI/CD.",
    );
    await page.fill(
      'textarea[name="conditions"]',
      "ДМС, удаленка 3/2, бонусы.",
    );
    await page.fill('input[name="city"]', "Москва");
    await page.getByLabel("Тип занятости").selectOption("full_time");
    await page.getByLabel("График").selectOption("remote");
    await page.fill('input[name="salaryFrom"]', "210000");
    await page.fill('input[name="salaryTo"]', "280000");

    await Promise.all([
      page.waitForURL("**/employer/vacancies"),
      page.click('button[type="submit"]'),
    ]);

    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("applicant updates resume and sees new stats", async ({ page }) => {
    await login(page, "alex@example.com", "test123");

    await page.goto("/applicant/resume/edit");
    const desiredPosition = `Automation QA ${Date.now()}`;

    await page.fill('input[name="desiredPosition"]', desiredPosition);
    await page.fill('input[name="city"]', "Санкт-Петербург");
    await page.fill('input[name="expectedSalary"]', "190000");
    await page.fill(
      'textarea[name="summary"]',
      "Эксперт по автоматизации тестирования и CI/CD.",
    );

    await page.click('button:has-text("Сохранить резюме")');
    await page.waitForTimeout(1000);

    await page.goto("/applicant/dashboard");
    await expect(page.getByText(desiredPosition)).toBeVisible();
    await expect(page.getByText("190 000")).toBeVisible();
  });
});
