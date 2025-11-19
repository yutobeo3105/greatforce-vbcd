import { test, expect } from "@playwright/test";

test.describe("Email Templates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Email Templates/i }).click();
    await expect(page).toHaveURL(/\/email-templates$/);
  });

  test("should display email templates page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Email Templates" })).toBeVisible();
  });

  test("should show new template button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New Template/i })).toBeVisible();
  });

  test("should open create template dialog", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    await expect(page.getByRole("heading", { name: "Create Email Template" })).toBeVisible();
  });

  test("should create a new email template", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Welcome Email");
    await page.getByPlaceholder("e.g., Onboarding").fill("Onboarding");
    await page.getByPlaceholder("Use {{firstName}}").fill("Welcome {{firstName}}!");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Hi {{firstName}},\n\nWelcome to {{company}}!");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Welcome Email")).toBeVisible();
  });

  test("should create template with variables", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Follow-up Template");
    await page.getByPlaceholder("Use {{firstName}}").fill("Following up with {{firstName}} {{lastName}}");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Hello {{firstName}} {{lastName}},\n\nThank you for your interest in {{company}}.");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Follow-up Template")).toBeVisible();
  });

  test("should cancel creating a template", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Test Template");
    
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByRole("heading", { name: "Create Email Template" })).not.toBeVisible();
  });

  test("should display template categories", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Categorized Template");
    await page.getByPlaceholder("e.g., Onboarding").fill("Sales");
    await page.getByPlaceholder("Use {{firstName}}").fill("Sales Subject");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Sales body");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Sales")).toBeVisible();
  });

  test("should preview a template", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Preview Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Hello {{firstName}}");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Dear {{firstName}},\n\nWelcome!");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /Preview/i }).first().click();
    
    await expect(page.getByRole("heading", { name: "Preview Email" })).toBeVisible();
    await expect(page.getByText("Hello John")).toBeVisible();
  });

  test("should update preview with custom variables", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Variable Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Hi {{firstName}}");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Hello {{firstName}}!");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /Preview/i }).first().click();
    
    const firstNameInput = page.locator('input[placeholder="firstName"]');
    await firstNameInput.clear();
    await firstNameInput.fill("Alice");
    
    await page.waitForTimeout(500);
    
    await expect(page.getByText("Hi Alice")).toBeVisible();
  });

  test("should edit a template", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Edit Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Original Subject");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Original Body");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /Edit/i }).first().click();
    
    await expect(page.getByRole("heading", { name: "Edit Email Template" })).toBeVisible();
  });

  test("should delete a template", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Delete Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Subject");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Body");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete Test")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    const deleteButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await deleteButton.click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete Test")).not.toBeVisible();
  });

  test("should show empty state when no templates exist", async ({ page }) => {
    const templates = await page.locator(".hover\\:shadow-md").all();
    
    for (const template of templates) {
      page.on("dialog", (dialog) => dialog.accept());
      const deleteBtn = template.locator("button").filter({ has: page.locator("svg") }).last();
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }
    
    await expect(page.getByText("No email templates yet")).toBeVisible();
  });

  test("should display template subject in card", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Subject Display Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Unique Subject Line");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Body content");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Unique Subject Line")).toBeVisible();
  });

  test("should create template without category", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("No Category Template");
    await page.getByPlaceholder("Use {{firstName}}").fill("Subject");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Body");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("No Category Template")).toBeVisible();
  });

  test("should show all template actions", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Actions Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Subject");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Body");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    const card = page.locator(".hover\\:shadow-md").first();
    await expect(card.getByRole("button", { name: /Preview/i })).toBeVisible();
    await expect(card.getByRole("button", { name: /Edit/i })).toBeVisible();
  });

  test("should handle multiple variables in preview", async ({ page }) => {
    await page.getByRole("button", { name: /New Template/i }).click();
    
    await page.getByPlaceholder("e.g., Welcome Email").fill("Multi-var Test");
    await page.getByPlaceholder("Use {{firstName}}").fill("Hello {{firstName}} {{lastName}}");
    await page.getByPlaceholder("Hi {{firstName}}").fill("Hi {{firstName}} from {{company}}, email: {{email}}");
    
    await page.getByRole("button", { name: "Create Template" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /Preview/i }).first().click();
    
    await expect(page.getByText(/Test Variables/)).toBeVisible();
  });
});
