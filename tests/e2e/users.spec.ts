import { test, expect } from "@playwright/test";

test.describe("Users", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Users/i }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test("should display users page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  });

  test("should show new user button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New User/i })).toBeVisible();
  });

  test("should create a new user", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Test User");
    await page.getByPlaceholder("e.g., john@example.com").fill("test@example.com");
    await page.getByPlaceholder("e.g., +1 234 567 8900").fill("+1 234 567 8900");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Test User")).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();
  });

  test("should filter users by role", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Admin User");
    await page.getByPlaceholder("e.g., john@example.com").fill("admin@example.com");
    
    const roleSelect = page.locator('select, [role="combobox"]').last();
    await roleSelect.click();
    await page.getByRole("option", { name: "Admin" }).click();
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    const filterSelect = page.locator('select, [role="combobox"]').first();
    await filterSelect.click();
    await page.getByRole("option", { name: "Admin" }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText("Admin User")).toBeVisible();
  });

  test("should display user role badge", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Badge Test User");
    await page.getByPlaceholder("e.g., john@example.com").fill("badge@example.com");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("SALES REP")).toBeVisible();
  });

  test("should edit a user", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Edit Test User");
    await page.getByPlaceholder("e.g., john@example.com").fill("edit@example.com");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /Edit/i }).first().click();
    
    await expect(page.getByRole("heading", { name: "Edit User" })).toBeVisible();
  });

  test("should delete a user", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Delete Test User");
    await page.getByPlaceholder("e.g., john@example.com").fill("delete@example.com");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete Test User")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    const deleteButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });

  test("should cancel creating a user", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Cancel Test");
    
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByRole("heading", { name: "Create User" })).not.toBeVisible();
  });

  test("should show empty state", async ({ page }) => {
    const users = await page.locator(".hover\\:shadow-md").all();
    
    for (const user of users) {
      page.on("dialog", (dialog) => dialog.accept());
      const deleteBtn = user.locator("button").filter({ has: page.locator("svg") }).last();
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }
    
    await expect(page.getByText(/No users found/i)).toBeVisible();
  });

  test("should display user phone number", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Phone Test User");
    await page.getByPlaceholder("e.g., john@example.com").fill("phone@example.com");
    await page.getByPlaceholder("e.g., +1 234 567 8900").fill("+1 555 123 4567");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("+1 555 123 4567")).toBeVisible();
  });

  test("should filter users by status", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Status Test User");
    await page.getByPlaceholder("e.g., john@example.com").fill("status@example.com");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    const statusFilter = page.locator('select, [role="combobox"]').nth(1);
    await statusFilter.click();
    await page.getByRole("option", { name: "Active" }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText("Status Test User")).toBeVisible();
  });

  test("should display role description", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Role Desc Test");
    await page.getByPlaceholder("e.g., john@example.com").fill("roledesc@example.com");
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Standard CRM access")).toBeVisible();
  });

  test("should create user with manager role", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Manager User");
    await page.getByPlaceholder("e.g., john@example.com").fill("manager@example.com");
    
    const roleSelect = page.locator('select, [role="combobox"]').last();
    await roleSelect.click();
    await page.getByRole("option", { name: "Manager" }).click();
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("MANAGER")).toBeVisible();
  });

  test("should create user with viewer role", async ({ page }) => {
    await page.getByRole("button", { name: /New User/i }).click();
    
    await page.getByPlaceholder("e.g., John Doe").fill("Viewer User");
    await page.getByPlaceholder("e.g., john@example.com").fill("viewer@example.com");
    
    const roleSelect = page.locator('select, [role="combobox"]').last();
    await roleSelect.click();
    await page.getByRole("option", { name: "Viewer" }).click();
    
    await page.getByRole("button", { name: "Create User" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("VIEWER")).toBeVisible();
  });
});
