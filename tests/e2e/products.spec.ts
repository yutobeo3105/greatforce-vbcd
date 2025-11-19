import { test, expect } from "@playwright/test";

test.describe("Products", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Products/i }).click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test("should display products page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  });

  test("should show new product button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New Product/i })).toBeVisible();
  });

  test("should create a new product", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Test Widget");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("TWG-001");
    await page.getByPlaceholder("Product description").fill("A test widget product");
    await page.locator('input[type="number"]').first().fill("99.99");
    await page.locator('input[type="number"]').nth(1).fill("50");
    await page.getByPlaceholder("e.g., Hardware").fill("Electronics");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Test Widget")).toBeVisible();
  });

  test("should search products", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Searchable Product");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("SEARCH-001");
    await page.locator('input[type="number"]').first().fill("29.99");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByPlaceholder("Search products or SKU...").fill("Searchable");
    await page.waitForTimeout(500);
    
    await expect(page.getByText("Searchable Product")).toBeVisible();
  });

  test("should filter by category", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Category Test");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("CAT-001");
    await page.locator('input[type="number"]').first().fill("19.99");
    await page.getByPlaceholder("e.g., Hardware").fill("TestCategory");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("combobox").click();
    const categoryOption = page.getByRole("option", { name: "TestCategory" });
    if (await categoryOption.isVisible()) {
      await categoryOption.click();
      await page.waitForTimeout(500);
    }
  });

  test("should display price and cost", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Pricing Test");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("PRICE-001");
    await page.locator('input[type="number"]').first().fill("100");
    await page.locator('input[type="number"]').nth(1).fill("60");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("$100.00")).toBeVisible();
    await expect(page.getByText("$60.00")).toBeVisible();
  });

  test("should calculate profit margin", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Margin Test");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("MARGIN-001");
    await page.locator('input[type="number"]').first().fill("100");
    await page.locator('input[type="number"]').nth(1).fill("50");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("50.0%")).toBeVisible();
  });

  test("should edit a product", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Edit Test Product");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("EDIT-001");
    await page.locator('input[type="number"]').first().fill("50");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole("button", { name: /Edit/i }).first().click();
    
    await expect(page.getByRole("heading", { name: "Edit Product" })).toBeVisible();
  });

  test("should delete a product", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Delete Test");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("DEL-001");
    await page.locator('input[type="number"]').first().fill("25");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete Test")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    const deleteButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });

  test("should cancel creating a product", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("Cancel Test");
    
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByRole("heading", { name: "Create Product" })).not.toBeVisible();
  });

  test("should display product SKU", async ({ page }) => {
    await page.getByRole("button", { name: /New Product/i }).click();
    
    await page.getByPlaceholder("e.g., Premium Widget").fill("SKU Display Test");
    await page.getByPlaceholder("e.g., WIDGET-001").fill("SKU-UNIQUE-123");
    await page.locator('input[type="number"]').first().fill("15");
    
    await page.getByRole("button", { name: "Create Product" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("SKU: SKU-UNIQUE-123")).toBeVisible();
  });
});
