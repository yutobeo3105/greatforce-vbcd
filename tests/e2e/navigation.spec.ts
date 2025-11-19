import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display sidebar navigation", async ({ page }) => {
    await expect(page.getByText("greatForce")).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contacts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Companies" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Deals" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Activities" })).toBeVisible();
  });

  test("should navigate to Dashboard", async ({ page }) => {
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("should navigate to Contacts", async ({ page }) => {
    await page.getByRole("link", { name: "Contacts" }).click();
    await expect(page).toHaveURL("/contacts");
    await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();
  });

  test("should navigate to Companies", async ({ page }) => {
    await page.getByRole("link", { name: "Companies" }).click();
    await expect(page).toHaveURL("/companies");
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
  });

  test("should navigate to Deals", async ({ page }) => {
    await page.getByRole("link", { name: "Deals" }).click();
    await expect(page).toHaveURL("/deals");
    await expect(page.getByRole("heading", { name: "Deals Pipeline" })).toBeVisible();
  });

  test("should navigate to Activities", async ({ page }) => {
    await page.getByRole("link", { name: "Activities" }).click();
    await expect(page).toHaveURL("/activities");
    await expect(page.getByRole("heading", { name: "Activities" })).toBeVisible();
  });

  test("should highlight active navigation item", async ({ page }) => {
    await page.getByRole("link", { name: "Contacts" }).click();
    const contactsLink = page.getByRole("link", { name: "Contacts" });
    await expect(contactsLink).toHaveClass(/bg-primary/);
  });

  test("should navigate between pages correctly", async ({ page }) => {
    await page.getByRole("link", { name: "Contacts" }).click();
    await expect(page).toHaveURL("/contacts");
    
    await page.getByRole("link", { name: "Companies" }).click();
    await expect(page).toHaveURL("/companies");
    
    await page.getByRole("link", { name: "Deals" }).click();
    await expect(page).toHaveURL("/deals");
    
    await page.getByRole("link", { name: "Activities" }).click();
    await expect(page).toHaveURL("/activities");
    
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
  });
});
