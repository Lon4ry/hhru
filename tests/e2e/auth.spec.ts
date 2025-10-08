import { test, expect } from "@playwright/test";

async function login(page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/"),
    page.click('button[type="submit"]'),
  ]);
}

test.describe("Authentication", () => {
  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpass");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Неверный email или пароль")).toBeVisible();
  });

  test("logs in applicant and shows dashboard stats", async ({ page }) => {
    await login(page, "alex@example.com", "test123");

    await expect(
      page.getByRole("heading", {
        name: "Технологичный найм: соединяем лучших специалистов с амбициозными компаниями",
      }),
    ).toBeVisible();

    await page.goto("/applicant/dashboard");
    await expect(
      page.getByRole("heading", { name: "Уведомления" }),
    ).toBeVisible();
    await expect(page.getByText("Всего откликов")).toBeVisible();
  });
});
