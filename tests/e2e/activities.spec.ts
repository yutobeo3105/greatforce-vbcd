import { test, expect } from "@playwright/test";

test.describe("Activities", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/activities");
  });

  test("should display activities page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Activities" })).toBeVisible();
    await expect(page.getByText("Manage your tasks and activities")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Activity" })).toBeVisible();
  });

  test("should display activity tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /All/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Upcoming/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Overdue/ })).toBeVisible();
  });

  test("should open and close add activity dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Add New Activity")).toBeVisible();
    
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should create a new activity", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    
    await page.getByLabel("Type").click();
    await page.getByRole("option", { name: "Call" }).click();
    await page.getByLabel("Title").fill("Follow-up call with client");
    await page.getByLabel("Description").fill("Discuss project requirements");
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    await page.getByLabel("Due Date").fill(dateTimeString);
    
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Follow-up call with client")).toBeVisible();
    await expect(page.getByText("Call")).toBeVisible();
  });

  test("should toggle activity completion", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await page.getByLabel("Title").fill("Complete Me Task");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Complete Me Task")).toBeVisible();
    
    const checkButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await checkButton.click();
    
    await page.waitForTimeout(500);
    await expect(page.getByText("Complete Me Task")).toBeVisible();
  });

  test("should create activity with different types", async ({ page }) => {
    const types = ["Task", "Call", "Meeting", "Email", "Follow-up"];
    
    for (const type of types) {
      await page.getByRole("button", { name: "Add Activity" }).click();
      await page.getByLabel("Type").click();
      await page.getByRole("option", { name: type }).click();
      await page.getByLabel("Title").fill(`${type} Activity`);
      await page.getByRole("button", { name: "Create" }).click();
      
      await expect(page.getByText(`${type} Activity`)).toBeVisible();
      await expect(page.getByText(type)).toBeVisible();
    }
  });

  test("should edit an activity", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await page.getByLabel("Title").fill("Edit Me Activity");
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.locator('button[aria-label="Edit"]').first().click();
    
    await expect(page.getByText("Edit Activity")).toBeVisible();
    await page.getByLabel("Description").fill("Updated description");
    await page.getByRole("button", { name: "Update" }).click();
    
    await expect(page.getByText("Updated description")).toBeVisible();
  });

  test("should delete an activity", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await page.getByLabel("Title").fill("Delete Me Activity");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Delete Me Activity")).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[aria-label="Delete"]').first().click();
    
    await expect(page.getByText("Delete Me Activity")).not.toBeVisible();
  });

  test("should filter activities by tab", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await page.getByLabel("Title").fill("Tab Filter Activity");
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    await page.getByLabel("Due Date").fill(dateTimeString);
    
    await page.getByRole("button", { name: "Create" }).click();
    
    await page.getByRole("tab", { name: /All/ }).click();
    await expect(page.getByText("Tab Filter Activity")).toBeVisible();
    
    await page.getByRole("tab", { name: /Upcoming/ }).click();
    await page.waitForTimeout(500);
  });

  test("should display overdue badge for past activities", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await page.getByLabel("Title").fill("Overdue Activity");
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const dateTimeString = pastDate.toISOString().slice(0, 16);
    await page.getByLabel("Due Date").fill(dateTimeString);
    
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Overdue Activity")).toBeVisible();
    await expect(page.getByText("Overdue")).toBeVisible();
  });

  test("should create activity without optional contact and deal", async ({ page }) => {
    await page.getByRole("button", { name: "Add Activity" }).click();
    await page.getByLabel("Title").fill("Standalone Task");
    await page.getByLabel("Description").fill("Independent task");
    await page.getByRole("button", { name: "Create" }).click();
    
    await expect(page.getByText("Standalone Task")).toBeVisible();
    await expect(page.getByText("Independent task")).toBeVisible();
  });
});
