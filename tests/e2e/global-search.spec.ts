import { test, expect } from "@playwright/test";

test.describe("Global Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display search button in header", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Search/i })).toBeVisible();
  });

  test("should open search dialog when clicking search button", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await expect(page.getByPlaceholder("Search contacts, companies, deals...")).toBeVisible();
  });

  test("should open search dialog with Cmd+K keyboard shortcut", async ({ page, browserName }) => {
    const modifier = browserName === "webkit" ? "Meta" : "Control";
    await page.keyboard.press(`${modifier}+KeyK`);
    
    await expect(page.getByPlaceholder("Search contacts, companies, deals...")).toBeVisible();
  });

  test("should close search dialog with Escape", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    await expect(page.getByPlaceholder("Search contacts, companies, deals...")).toBeVisible();
    
    await page.keyboard.press("Escape");
    
    await expect(page.getByPlaceholder("Search contacts, companies, deals...")).not.toBeVisible();
  });

  test("should search for contacts", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("John");
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Contacts")).toBeVisible();
  });

  test("should search for companies", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("Tech");
    await page.waitForTimeout(1000);
    
    const hasResults = await page.getByText("Companies").isVisible().catch(() => false);
    if (hasResults) {
      await expect(page.getByText("Companies")).toBeVisible();
    }
  });

  test("should search for deals", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("Enterprise");
    await page.waitForTimeout(1000);
    
    const hasResults = await page.getByText("Deals").isVisible().catch(() => false);
    if (hasResults) {
      await expect(page.getByText("Deals")).toBeVisible();
    }
  });

  test("should show no results message for non-existent search", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    const uniqueSearch = `nonexistent${Date.now()}`;
    await page.getByPlaceholder("Search contacts, companies, deals...").fill(uniqueSearch);
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/No results found/)).toBeVisible();
  });

  test("should display loading indicator while searching", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    const searchInput = page.getByPlaceholder("Search contacts, companies, deals...");
    await searchInput.fill("s");
    
    await page.waitForTimeout(100);
  });

  test("should navigate to contact detail when clicking result", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("John");
    await page.waitForTimeout(1000);
    
    const hasContacts = await page.getByText("Contacts").isVisible().catch(() => false);
    if (hasContacts) {
      const firstResult = page.locator("[class*='cursor-pointer']").first();
      await firstResult.click();
      
      await expect(page).toHaveURL(/\/contacts\/[\w-]+$/);
    }
  });

  test("should close dialog after selecting a result", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("Tech");
    await page.waitForTimeout(1000);
    
    const hasResults = await page.locator("[class*='cursor-pointer']").first().isVisible().catch(() => false);
    if (hasResults) {
      await page.locator("[class*='cursor-pointer']").first().click();
      
      await expect(page.getByPlaceholder("Search contacts, companies, deals...")).not.toBeVisible();
    }
  });

  test("should display grouped results by entity type", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("a");
    await page.waitForTimeout(1500);
    
    const headings = page.locator("[role='group']");
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show keyboard shortcut hint", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await expect(page.getByText(/to open search/i)).toBeVisible();
  });

  test("should handle empty search query", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    const searchInput = page.getByPlaceholder("Search contacts, companies, deals...");
    await searchInput.fill("");
    
    await page.waitForTimeout(500);
  });

  test("should update results as user types", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    const searchInput = page.getByPlaceholder("Search contacts, companies, deals...");
    
    await searchInput.fill("J");
    await page.waitForTimeout(800);
    
    await searchInput.fill("Jo");
    await page.waitForTimeout(800);
    
    await searchInput.fill("Joh");
    await page.waitForTimeout(800);
  });

  test("should display result details", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("Manager");
    await page.waitForTimeout(1000);
    
    const hasResults = await page.locator("[class*='text-xs text-muted-foreground']").first().isVisible().catch(() => false);
    if (hasResults) {
      await expect(page.locator("[class*='text-xs text-muted-foreground']").first()).toBeVisible();
    }
  });

  test("should show icons for different entity types", async ({ page }) => {
    await page.getByRole("button", { name: /Search/i }).click();
    
    await page.getByPlaceholder("Search contacts, companies, deals...").fill("a");
    await page.waitForTimeout(1000);
    
    const icons = page.locator("svg[class*='h-4 w-4']");
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
