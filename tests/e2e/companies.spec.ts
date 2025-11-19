import { test, expect } from "@playwright/test";

test.describe("Companies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/companies");
  });

  test("should display companies page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
    await expect(page.getByText("Manage your company accounts")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Company" })).toBeVisible();
  });

  test("should open and close add company dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Company" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Add New Company")).toBeVisible();
    
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should create a new company", async ({ page }) => {
    await page.getByRole("button", { name: "Add Company" }).click();
    
    await page.getByLabel("Company Name").fill("Acme Corp");
    await page.getByLabel("Website").fill("https://acme.com");
    await page.getByLabel("Industry").click();
    await page.getByRole("option", { name: "Technology" }).click();
    await page.getByLabel("Company Size").click();
    await page.getByRole("option", { name: "51-200" }).click();
    await page.getByLabel("Description").fill("Leading tech company");
    
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Acme Corp")).toBeVisible();
    await expect(page.getByText("Technology")).toBeVisible();
  });

  test("should search for companies", async ({ page }) => {
    await page.getByRole("button", { name: "Add Company" }).click();
    await page.getByLabel("Company Name").fill("TechStart Inc");
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.getByPlaceholder("Search companies...").fill("TechStart");
    await expect(page.getByText("TechStart Inc")).toBeVisible();
    
    await page.getByPlaceholder("Search companies...").fill("NonExistent");
    await expect(page.getByText("TechStart Inc")).not.toBeVisible();
  });

  test("should edit a company", async ({ page }) => {
    await page.getByRole("button", { name: "Add Company" }).click();
    await page.getByLabel("Company Name").fill("EditMe Corp");
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.locator('button[aria-label="Edit"]').first().click();
    
    await expect(page.getByText("Edit Company")).toBeVisible();
    await page.getByLabel("Website").fill("https://editme.com");
    await page.getByRole("button", { name: "Update" }).click();
    
    await expect(page.getByText("https://editme.com")).toBeVisible();
  });

  test("should delete a company", async ({ page }) => {
    await page.getByRole("button", { name: "Add Company" }).click();
    await page.getByLabel("Company Name").fill("Delete Corp");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Delete Corp")).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[aria-label="Delete"]').first().click();
    
    await expect(page.getByText("Delete Corp")).not.toBeVisible();
  });

  test("should display company details", async ({ page }) => {
    await page.getByRole("button", { name: "Add Company" }).click();
    await page.getByLabel("Company Name").fill("Details Corp");
    await page.getByLabel("Website").fill("https://details.com");
    await page.getByLabel("Industry").click();
    await page.getByRole("option", { name: "Finance" }).click();
    await page.getByLabel("Company Size").click();
    await page.getByRole("option", { name: "201-500" }).click();
    await page.getByLabel("Description").fill("Financial services company");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Details Corp")).toBeVisible();
    await expect(page.getByText("Finance")).toBeVisible();
    await expect(page.getByText("201-500 employees")).toBeVisible();
  });
});
