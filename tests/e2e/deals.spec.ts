import { test, expect } from "@playwright/test";

test.describe("Deals Pipeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/deals");
  });

  test("should display deals pipeline page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Deals Pipeline" })).toBeVisible();
    await expect(page.getByText("Drag deals between stages")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Deal" })).toBeVisible();
  });

  test("should display all deal stages", async ({ page }) => {
    await expect(page.getByText("Lead")).toBeVisible();
    await expect(page.getByText("Qualified")).toBeVisible();
    await expect(page.getByText("Proposal")).toBeVisible();
    await expect(page.getByText("Negotiation")).toBeVisible();
    await expect(page.getByText("Closed Won")).toBeVisible();
    await expect(page.getByText("Closed Lost")).toBeVisible();
  });

  test("should open and close add deal dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Add New Deal")).toBeVisible();
    
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should create a new deal", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    
    await page.getByLabel("Deal Title").fill("Big Enterprise Deal");
    await page.getByLabel("Value").fill("50000");
    await page.getByLabel("Probability (%)").fill("75");
    await page.getByLabel("Stage").click();
    await page.getByRole("option", { name: "Qualified" }).click();
    await page.getByLabel("Description").fill("Large enterprise contract");
    
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Big Enterprise Deal")).toBeVisible();
    await expect(page.getByText("$50,000")).toBeVisible();
  });

  test("should edit a deal", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    await page.getByLabel("Deal Title").fill("Edit Deal");
    await page.getByLabel("Value").fill("10000");
    await page.getByLabel("Probability (%)").fill("50");
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.locator('button[aria-label="Edit"]').first().click();
    
    await expect(page.getByText("Edit Deal")).toBeVisible();
    await page.getByLabel("Value").fill("15000");
    await page.getByRole("button", { name: "Update" }).click();
    
    await expect(page.getByText("$15,000")).toBeVisible();
  });

  test("should delete a deal", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    await page.getByLabel("Deal Title").fill("Delete Deal");
    await page.getByLabel("Value").fill("5000");
    await page.getByLabel("Probability (%)").fill("25");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Delete Deal")).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[aria-label="Delete"]').first().click();
    
    await expect(page.getByText("Delete Deal")).not.toBeVisible();
  });

  test("should display deal probability badge", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    await page.getByLabel("Deal Title").fill("Probability Deal");
    await page.getByLabel("Value").fill("20000");
    await page.getByLabel("Probability (%)").fill("90");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("90% probability")).toBeVisible();
  });

  test("should create deal with expected close date", async ({ page }) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split('T')[0] ?? '';
    
    await page.getByRole("button", { name: "Add Deal" }).click();
    await page.getByLabel("Deal Title").fill("Dated Deal");
    await page.getByLabel("Value").fill("30000");
    await page.getByLabel("Probability (%)").fill("60");
    await page.getByLabel("Expected Close Date").fill(dateString);
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Dated Deal")).toBeVisible();
  });

  test("should move deal between stages", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    await page.getByLabel("Deal Title").fill("Moving Deal");
    await page.getByLabel("Value").fill("25000");
    await page.getByLabel("Probability (%)").fill("50");
    await page.getByLabel("Stage").click();
    await page.getByRole("option", { name: "Lead" }).click();
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Moving Deal")).toBeVisible();
    
    await page.locator('button[aria-label="Edit"]').first().click();
    await page.getByLabel("Stage").click();
    await page.getByRole("option", { name: "Qualified" }).click();
    await page.getByRole("button", { name: "Update" }).click();
    
    await page.waitForTimeout(500);
  });

  test("should create deal without optional contact and company", async ({ page }) => {
    await page.getByRole("button", { name: "Add Deal" }).click();
    await page.getByLabel("Deal Title").fill("Standalone Deal");
    await page.getByLabel("Value").fill("35000");
    await page.getByLabel("Probability (%)").fill("80");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Standalone Deal")).toBeVisible();
    await expect(page.getByText("$35,000")).toBeVisible();
  });
});
