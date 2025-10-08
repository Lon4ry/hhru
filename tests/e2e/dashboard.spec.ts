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

test.describe("Dashboards", () => {
  test("admin dashboard shows stats and logs", async ({ page }) => {
    await login(page, "admin@stafftech.ru", "admin123");

    await page.goto("/admin/dashboard");
    await expect(page.getByText("Всего пользователей")).toBeVisible();
    await expect(page.getByText("Активные вакансии")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Системный журнал" })).toBeVisible();
    await expect(page.getByText("Регистрация", { exact: false })).toBeVisible();
  });
});
