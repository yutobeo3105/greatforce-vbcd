import { test, expect } from "@playwright/test";

test.describe("Bulk Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bulk-actions");
    await page.waitForLoadState("networkidle");
  });

  test("should display bulk actions page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Bulk Actions Demo" })).toBeVisible();
    await expect(page.getByText("Select multiple contacts to perform bulk operations")).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    await expect(page.getByPlaceholder("Search contacts...")).toBeVisible();
  });

  test("should select individual contact", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      
      await expect(page.getByText(/1 item selected/)).toBeVisible();
    }
  });

  test("should select all contacts", async ({ page }) => {
    const selectAllCheckbox = page.locator('input[type="checkbox"]').first();
    await selectAllCheckbox.click();
    
    await expect(page.getByText(/items? selected/)).toBeVisible();
  });

  test("should show bulk actions bar when items selected", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      
      await expect(page.getByText("Delete")).toBeVisible();
      await expect(page.getByText("Update Status")).toBeVisible();
      await expect(page.getByText("Clear")).toBeVisible();
    }
  });

  test("should clear selection", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      await expect(page.getByText(/1 item selected/)).toBeVisible();
      
      await page.getByRole("button", { name: "Clear" }).click();
      await expect(page.getByText(/items? selected/)).not.toBeVisible();
    }
  });

  test("should display update status dropdown", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      
      await page.getByRole("button", { name: "Update Status" }).click();
      await expect(page.getByRole("menuitem", { name: /Active/i })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Inactive/i })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Archived/i })).toBeVisible();
    }
  });

  test("should update status for selected contacts", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      
      await page.getByRole("button", { name: "Update Status" }).click();
      await page.getByRole("menuitem", { name: /Inactive/i }).click();
      
      await expect(page.getByText("Bulk Update Complete")).toBeVisible();
    }
  });

  test("should select multiple contacts", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 2) {
      await checkboxes.nth(1).click();
      await checkboxes.nth(2).click();
      
      await expect(page.getByText(/2 items selected/)).toBeVisible();
    }
  });

  test("should display contact cards with selection checkboxes", async ({ page }) => {
    const cards = page.locator('div[class*="Card"]');
    const count = await cards.count();
    
    if (count > 0) {
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test("should search contacts", async ({ page }) => {
    await page.getByPlaceholder("Search contacts...").fill("test");
    await page.waitForTimeout(500);
    
    const noResults = page.getByText("No contacts found");
    await expect(noResults).toBeVisible();
  });

  test("should unselect contact when clicking checkbox again", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      await expect(page.getByText(/1 item selected/)).toBeVisible();
      
      await checkboxes.nth(1).click();
      await expect(page.getByText(/items? selected/)).not.toBeVisible();
    }
  });

  test("should show confirmation for bulk delete", async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(1).click();
      
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Are you sure');
        await dialog.dismiss();
      });
      
      await page.getByRole("button", { name: "Delete" }).click();
    }
  });
});
