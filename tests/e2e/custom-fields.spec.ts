import { test, expect } from "@playwright/test";

test.describe("Custom Fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Contacts/i }).click();
    await expect(page).toHaveURL(/\/contacts$/);
    await page.locator(".hover\\:shadow-md").first().click();
    await expect(page).toHaveURL(/\/contacts\/[\w-]+$/);
  });

  test("should display custom fields tab", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Custom Fields" })).toBeVisible();
  });

  test("should show add custom field button", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await expect(page.getByRole("button", { name: /Add Custom Field/i })).toBeVisible();
  });

  test("should create a text custom field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("LinkedIn Profile");
    await page.getByPlaceholder("Value").fill("https://linkedin.com/in/johndoe");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("LinkedIn Profile")).toBeVisible();
  });

  test("should create a number custom field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Years Experience");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Number" }).click();
    
    await page.locator('input[type="number"]').fill("5");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Years Experience")).toBeVisible();
  });

  test("should create a date custom field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Last Contact Date");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Date" }).click();
    
    await page.locator('input[type="date"]').fill("2024-01-15");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Last Contact Date")).toBeVisible();
  });

  test("should create a boolean custom field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Is VIP Customer");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Yes/No" }).click();
    
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "Yes" }).click();
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Is VIP Customer")).toBeVisible();
    await expect(page.getByText("Yes")).toBeVisible();
  });

  test("should edit a custom field value", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Department");
    await page.getByPlaceholder("Value").fill("Sales");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator("button").filter({ has: page.locator("svg") }).first().click();
    
    const input = page.locator('input[class*="h-8"]').first();
    await input.clear();
    await input.fill("Marketing");
    
    await page.locator("button").filter({ has: page.locator("svg") }).first().click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Marketing")).toBeVisible();
  });

  test("should cancel editing a custom field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Location");
    await page.getByPlaceholder("Value").fill("New York");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator("button").filter({ has: page.locator("svg") }).first().click();
    
    const input = page.locator('input[class*="h-8"]').first();
    await input.clear();
    await input.fill("Los Angeles");
    
    await page.locator("button").filter({ has: page.locator("svg") }).nth(1).click();
    
    await expect(page.getByText("New York")).toBeVisible();
  });

  test("should delete a custom field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Temporary Field");
    await page.getByPlaceholder("Value").fill("Test Value");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Temporary Field")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    await page.locator("button").filter({ has: page.locator("svg") }).nth(1).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Temporary Field")).not.toBeVisible();
  });

  test("should cancel adding a new field", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Test Field");
    
    await page.getByRole("button", { name: /Cancel/i }).click();
    
    await expect(page.getByPlaceholder("Field name")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Add Custom Field/i })).toBeVisible();
  });

  test("should show empty state when no custom fields exist", async ({ page }) => {
    await page.goto("/contacts");
    const allContacts = await page.locator(".hover\\:shadow-md").all();
    if (allContacts.length > 10) {
      await allContacts[10]?.click();
    } else {
      await allContacts[allContacts.length - 1]?.click();
    }
    
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    
    await expect(page.getByText("No custom fields yet. Add one above.")).toBeVisible();
  });

  test("should display field type badges", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Test Field");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Email" }).click();
    
    await page.getByPlaceholder("Value").fill("test@example.com");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Email")).toBeVisible();
  });

  test("should create URL custom field with clickable link", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Website");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "URL" }).click();
    
    await page.getByPlaceholder("Value").fill("https://example.com");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Website")).toBeVisible();
    await expect(page.getByRole("link", { name: "https://example.com" })).toBeVisible();
  });

  test("should persist custom fields across tab switches", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    await page.getByRole("button", { name: /Add Custom Field/i }).click();
    
    await page.getByPlaceholder("Field name").fill("Persistent Field");
    await page.getByPlaceholder("Value").fill("Persistent Value");
    
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("tab", { name: "Notes" }).click();
    await page.getByRole("tab", { name: "Custom Fields" }).click();
    
    await expect(page.getByText("Persistent Field")).toBeVisible();
  });
});
