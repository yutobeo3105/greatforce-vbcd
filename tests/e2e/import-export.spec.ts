import { test, expect } from "@playwright/test";

test.describe("Import/Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/import-export");
  });

  test("should display import/export page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Import/Export" })).toBeVisible();
    await expect(page.getByText("Import and export your CRM data in CSV or JSON format")).toBeVisible();
  });

  test("should display tabs for contacts, companies, and deals", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Contacts" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Companies" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Deals" })).toBeVisible();
  });

  test("should display export and import cards", async ({ page }) => {
    await expect(page.getByText("Export contacts")).toBeVisible();
    await expect(page.getByText("Import contacts")).toBeVisible();
    await expect(page.getByRole("button", { name: /Export as CSV/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Import contacts/i })).toBeVisible();
  });

  test("should switch between CSV and JSON format", async ({ page }) => {
    const formatSelects = page.locator('button[role="combobox"]');
    await formatSelects.first().click();
    await page.getByRole("option", { name: /JSON/i }).first().click();
    
    await expect(page.getByRole("button", { name: /Export as JSON/i })).toBeVisible();
  });

  test("should display template guide", async ({ page }) => {
    await expect(page.getByText("Template & Format Guide")).toBeVisible();
    await expect(page.getByText(/Use this template as a reference/)).toBeVisible();
  });

  test("should import contacts from CSV", async ({ page }) => {
    const csvData = `firstName,lastName,email,phone,jobTitle,status,company
Test,User,test@example.com,555-1234,Developer,ACTIVE,Test Corp`;

    await page.getByPlaceholder("Paste CSV data here...").fill(csvData);
    await page.getByRole("button", { name: /Import contacts/i }).click();

    await expect(page.getByText("Import Results")).toBeVisible();
    await expect(page.getByText("Created")).toBeVisible();
  });

  test("should import contacts from JSON", async ({ page }) => {
    const jsonData = JSON.stringify([{
      firstName: "JSON",
      lastName: "User",
      email: "json@example.com",
      phone: "555-5678",
      jobTitle: "Manager",
      status: "ACTIVE",
      company: "JSON Corp"
    }]);

    const formatSelects = page.locator('button[role="combobox"]');
    await formatSelects.last().click();
    await page.getByRole("option", { name: /JSON/i }).last().click();

    await page.getByPlaceholder("Paste JSON data here...").fill(jsonData);
    await page.getByRole("button", { name: /Import contacts/i }).click();

    await expect(page.getByText("Import Results")).toBeVisible();
  });

  test("should switch to companies tab and show appropriate fields", async ({ page }) => {
    await page.getByRole("tab", { name: "Companies" }).click();
    
    await expect(page.getByText("Export companies")).toBeVisible();
    await expect(page.getByText("Import companies")).toBeVisible();
    await expect(page.getByRole("button", { name: /Import companies/i })).toBeVisible();
  });

  test("should import companies from CSV", async ({ page }) => {
    await page.getByRole("tab", { name: "Companies" }).click();
    
    const csvData = `name,industry,website,phone,address
Test Company,Technology,https://test.com,555-9999,123 Test St`;

    await page.getByPlaceholder("Paste CSV data here...").fill(csvData);
    await page.getByRole("button", { name: /Import companies/i }).click();

    await expect(page.getByText("Import Results")).toBeVisible();
  });

  test("should switch to deals tab", async ({ page }) => {
    await page.getByRole("tab", { name: "Deals" }).click();
    
    await expect(page.getByText("Export deals")).toBeVisible();
    await expect(page.getByText("Import deals")).toBeVisible();
  });

  test("should show error for invalid CSV data", async ({ page }) => {
    const invalidCsv = "invalid,data,without,proper,headers";

    await page.getByPlaceholder("Paste CSV data here...").fill(invalidCsv);
    await page.getByRole("button", { name: /Import contacts/i }).click();

    await expect(page.getByText("Import Results")).toBeVisible();
    await expect(page.getByText("Errors")).toBeVisible();
  });

  test("should show error for empty import", async ({ page }) => {
    await page.getByRole("button", { name: /Import contacts/i }).click();

    await expect(page.getByText("No Data")).toBeVisible();
  });

  test("should display template for all entity types", async ({ page }) => {
    await expect(page.getByText("firstName,lastName,email")).toBeVisible();
    
    await page.getByRole("tab", { name: "Companies" }).click();
    await expect(page.getByText("name,industry,website")).toBeVisible();
    
    await page.getByRole("tab", { name: "Deals" }).click();
    await expect(page.getByText("title,value,stage")).toBeVisible();
  });
});
