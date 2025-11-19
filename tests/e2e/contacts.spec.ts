import { test, expect } from "@playwright/test";

test.describe("Contacts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contacts");
  });

  test("should display contacts page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();
    await expect(page.getByText("Manage your contacts and relationships")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Contact" })).toBeVisible();
  });

  test("should open and close add contact dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Add New Contact")).toBeVisible();
    
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should create a new contact", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    
    await page.getByLabel("First Name").fill("John");
    await page.getByLabel("Last Name").fill("Doe");
    await page.getByLabel("Email").fill("john.doe@example.com");
    await page.getByLabel("Phone").fill("+1234567890");
    await page.getByLabel("Title").fill("Software Engineer");
    await page.getByLabel("Tags").fill("lead, developer");
    await page.getByLabel("Notes").fill("Met at tech conference");
    
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("john.doe@example.com")).toBeVisible();
  });

  test("should search for contacts", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await page.getByLabel("First Name").fill("Jane");
    await page.getByLabel("Last Name").fill("Smith");
    await page.getByLabel("Email").fill("jane.smith@example.com");
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.getByPlaceholder("Search contacts...").fill("Jane");
    await expect(page.getByText("Jane Smith")).toBeVisible();
    
    await page.getByPlaceholder("Search contacts...").fill("NonExistent");
    await expect(page.getByText("Jane Smith")).not.toBeVisible();
  });

  test("should edit a contact", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await page.getByLabel("First Name").fill("Bob");
    await page.getByLabel("Last Name").fill("Johnson");
    await page.getByLabel("Email").fill("bob.johnson@example.com");
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.locator('button[aria-label="Edit"]').first().click();
    
    await expect(page.getByText("Edit Contact")).toBeVisible();
    await page.getByLabel("Title").fill("Senior Developer");
    await page.getByRole("button", { name: "Update" }).click();
    
    await expect(page.getByText("Senior Developer")).toBeVisible();
  });

  test("should delete a contact", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await page.getByLabel("First Name").fill("Delete");
    await page.getByLabel("Last Name").fill("Me");
    await page.getByLabel("Email").fill("delete.me@example.com");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Delete Me")).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[aria-label="Delete"]').first().click();
    
    await expect(page.getByText("Delete Me")).not.toBeVisible();
  });

  test("should display contact tags", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await page.getByLabel("First Name").fill("Tagged");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email").fill("tagged@example.com");
    await page.getByLabel("Tags").fill("vip, enterprise");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("vip")).toBeVisible();
    await expect(page.getByText("enterprise")).toBeVisible();
  });

  test("should create contact without selecting optional company", async ({ page }) => {
    await page.getByRole("button", { name: "Add Contact" }).click();
    await page.getByLabel("First Name").fill("Solo");
    await page.getByLabel("Last Name").fill("Worker");
    await page.getByLabel("Email").fill("solo.worker@example.com");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Solo Worker")).toBeVisible();
    await expect(page.getByText("solo.worker@example.com")).toBeVisible();
  });
});
