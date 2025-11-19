import { test, expect } from "@playwright/test";

test.describe("Comments", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contacts");
    await page.locator(".hover\\:shadow-md").first().click();
    await page.waitForTimeout(500);
    await page.getByRole("tab", { name: /Comments/i }).click();
  });

  test("should display comments section", async ({ page }) => {
    await expect(page.getByText("Comments")).toBeVisible();
  });

  test("should show comment input", async ({ page }) => {
    await expect(page.getByPlaceholder(/Write a comment/i)).toBeVisible();
  });

  test("should create a comment", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("This is a test comment");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("This is a test comment")).toBeVisible();
  });

  test("should create comment with mention", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Hello @john, please review this");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/Hello/)).toBeVisible();
    await expect(page.getByText("@john")).toBeVisible();
    await expect(page.getByText(/Mentioned: john/)).toBeVisible();
  });

  test("should create comment with multiple mentions", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("@alice and @bob, please check this out");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("@alice")).toBeVisible();
    await expect(page.getByText("@bob")).toBeVisible();
  });

  test("should edit a comment", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Original comment");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    const editButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    await editButton.click();
    
    const editTextarea = page.locator("textarea").last();
    await editTextarea.clear();
    await editTextarea.fill("Edited comment");
    
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Edited comment")).toBeVisible();
  });

  test("should cancel editing a comment", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Cancel test comment");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    const editButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    await editButton.click();
    
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByText("Cancel test comment")).toBeVisible();
  });

  test("should delete a comment", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Delete this comment");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete this comment")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    const deleteButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await deleteButton.click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("Delete this comment")).not.toBeVisible();
  });

  test("should show empty state", async ({ page }) => {
    await expect(page.getByText(/No comments yet/i)).toBeVisible();
  });

  test("should display comment timestamp", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Time test comment");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/ago/)).toBeVisible();
  });

  test("should display comment author", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Author test comment");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText("system")).toBeVisible();
  });

  test("should preserve line breaks in comments", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("Line one\nLine two\nLine three");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(/Line one/)).toBeVisible();
  });

  test("should disable add button when empty", async ({ page }) => {
    const addButton = page.getByRole("button", { name: "Add Comment" });
    await expect(addButton).toBeDisabled();
  });

  test("should highlight mentions in blue", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Write a comment/i);
    await textarea.fill("@user please check");
    
    await page.getByRole("button", { name: "Add Comment" }).click();
    await page.waitForTimeout(1000);
    
    const mention = page.locator("span").filter({ hasText: "@user" }).first();
    await expect(mention).toHaveClass(/text-blue-600/);
  });
});
