import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display dashboard with title and stats", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Welcome back!")).toBeVisible();
    
    await expect(page.getByText("Total Contacts")).toBeVisible();
    await expect(page.getByRole("link", { name: /Companies/ })).toBeVisible();
    await expect(page.getByText("Active Deals")).toBeVisible();
    await expect(page.getByText("Total Value")).toBeVisible();
  });

  test("should display recent contacts section", async ({ page }) => {
    await expect(page.getByText("Recent Contacts")).toBeVisible();
  });

  test("should display upcoming activities section", async ({ page }) => {
    await expect(page.getByText("Upcoming Activities", { exact: true }).first()).toBeVisible();
  });

  test("should display recent deals section", async ({ page }) => {
    await expect(page.getByText("Recent Deals")).toBeVisible();
  });

  test("should navigate to contacts page from stat card", async ({ page }) => {
    await page.getByText("Total Contacts").click();
    await expect(page).toHaveURL("/contacts");
  });

  test("should navigate to companies page from stat card", async ({ page }) => {
    await page.getByRole("link", { name: /Companies \d+/ }).click();
    await expect(page).toHaveURL("/companies");
  });

  test("should navigate to deals page from stat card", async ({ page }) => {
    await page.getByText("Active Deals").click();
    await expect(page).toHaveURL("/deals");
  });
});
