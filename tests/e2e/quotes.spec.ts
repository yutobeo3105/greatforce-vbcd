import { test, expect } from "@playwright/test";

test.describe("Quotes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Quotes/i }).click();
    await expect(page).toHaveURL(/\/quotes$/);
  });

  test("should display quotes page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Quotes" })).toBeVisible();
  });

  test("should show new quote button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New Quote/i })).toBeVisible();
  });

  test("should create a new quote", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-TEST-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Test Quote");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Test Quote")).toBeVisible();
    await expect(page.getByText("#Q-TEST-001")).toBeVisible();
  });

  test("should filter quotes by status", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-FILTER-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Filter Test");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Draft" }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText("Filter Test")).toBeVisible();
  });

  test("should view quote details", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-VIEW-001");
    await page.getByPlaceholder("e.g., Website Development").fill("View Test Quote");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    
    await expect(page.getByRole("heading", { name: "Quote Details" })).toBeVisible();
    await expect(page.getByText("#Q-VIEW-001")).toBeVisible();
  });

  test("should add line item to quote", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Test Product");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("PROD-001");
    await page.locator('input[type="number"]').first().fill("100");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await page.goto("/quotes");
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-ITEM-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Item Test");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    await page.getByRole("button", { name: /Add Item/i }).click();
    
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /Test Product/i }).click();
    
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Test Product")).toBeVisible();
  });

  test("should calculate quote total", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Calc Product");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("CALC-001");
    await page.locator('input[type="number"]').first().fill("50");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await page.goto("/quotes");
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-CALC-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Calc Test");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    await page.getByRole("button", { name: /Add Item/i }).click();
    
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /Calc Product/i }).click();
    
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.clear();
    await quantityInput.fill("2");
    
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("$100.00")).toBeVisible();
  });

  test("should delete a quote", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-DEL-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Delete Test");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete Test")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    const deleteButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });

  test("should change quote status", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-STATUS-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Status Test");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    
    const statusSelect = page.locator('select, [role="combobox"]').first();
    await statusSelect.click();
    await page.getByRole("option", { name: "Sent" }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByText("SENT")).toBeVisible();
  });

  test("should display quote with notes", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-NOTES-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Notes Test");
    await page.getByPlaceholder("Internal notes...").fill("Test internal notes");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    
    await expect(page.getByText("Test internal notes")).toBeVisible();
  });

  test("should display quote with terms", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-TERMS-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Terms Test");
    await page.getByPlaceholder("Payment terms, delivery conditions...").fill("Net 30 payment terms");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    
    await expect(page.getByText("Net 30 payment terms")).toBeVisible();
  });

  test("should cancel creating a quote", async ({ page }) => {
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-CANCEL-001");
    
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByRole("heading", { name: "Create Quote" })).not.toBeVisible();
  });

  test("should show empty state", async ({ page }) => {
    const quotes = await page.locator(".hover\\:shadow-md").all();
    
    for (const quote of quotes) {
      page.on("dialog", (dialog) => dialog.accept());
      const deleteBtn = quote.locator("button").filter({ has: page.locator("svg") }).last();
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }
    
    await expect(page.getByText("No quotes found")).toBeVisible();
  });

  test("should remove line item from quote", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Remove Product");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("REM-001");
    await page.locator('input[type="number"]').first().fill("25");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await page.goto("/quotes");
    await page.getByRole("button", { name: /New Quote/i }).click();
    
    await page.getByPlaceholder("e.g., Q-2024-001").fill("Q-REM-001");
    await page.getByPlaceholder("e.g., Website Development").fill("Remove Item Test");
    
    await page.getByRole("button", { name: "Create Quote" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /View/i }).first().click();
    await page.getByRole("button", { name: /Add Item/i }).click();
    
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /Remove Product/i }).click();
    
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.waitForTimeout(1000);
    
    page.on("dialog", (dialog) => dialog.accept());
    
    const removeButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await removeButton.click();
    await page.waitForTimeout(1000);
  });
});
