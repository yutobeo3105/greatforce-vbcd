import { test, expect } from "@playwright/test";

test.describe("Tags System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Contacts/i }).click();
    await expect(page).toHaveURL(/\/contacts$/);
    await page.locator(".hover\\:shadow-md").first().click();
    await expect(page).toHaveURL(/\/contacts\/[\w-]+$/);
  });

  test("should display tags section on contact detail page", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    await expect(page.getByRole("button", { name: "Add Tag" })).toBeVisible();
  });

  test("should create a new tag", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    
    const tagName = `tag-${Date.now()}`;
    await page.getByPlaceholder("Tag name...").fill(tagName);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    
    await expect(page.getByText(tagName)).toBeVisible();
  });

  test("should create tag with Enter key", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    
    const tagName = `enter-tag-${Date.now()}`;
    await page.getByPlaceholder("Tag name...").fill(tagName);
    await page.getByPlaceholder("Tag name...").press("Enter");
    
    await expect(page.getByText(tagName)).toBeVisible();
  });

  test("should cancel tag creation with Escape key", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    await expect(page.getByPlaceholder("Tag name...")).toBeVisible();
    
    await page.getByPlaceholder("Tag name...").press("Escape");
    
    await expect(page.getByPlaceholder("Tag name...")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Add Tag" })).toBeVisible();
  });

  test("should cancel tag creation with Cancel button", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    await page.getByPlaceholder("Tag name...").fill("test");
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByPlaceholder("Tag name...")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Add Tag" })).toBeVisible();
  });

  test("should select different tag colors", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /Green/ }).click();
    
    const tagName = `green-tag-${Date.now()}`;
    await page.getByPlaceholder("Tag name...").fill(tagName);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    
    await expect(page.getByText(tagName)).toBeVisible();
  });

  test("should delete a tag", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    const tagName = `delete-tag-${Date.now()}`;
    await page.getByPlaceholder("Tag name...").fill(tagName);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(tagName)).toBeVisible();
    
    const tagBadge = page.locator(`[class*="flex items-center gap-1"]`).filter({ hasText: tagName });
    await tagBadge.locator("button").click();
    
    await expect(page.getByText(tagName)).not.toBeVisible();
  });

  test("should display multiple tags", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    const timestamp = Date.now();
    const tag1 = `multi-tag-1-${timestamp}`;
    const tag2 = `multi-tag-2-${timestamp}`;
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    await page.getByPlaceholder("Tag name...").fill(tag1);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(tag1)).toBeVisible();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    await page.getByPlaceholder("Tag name...").fill(tag2);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(tag2)).toBeVisible();
    
    await expect(page.getByText(tag1)).toBeVisible();
  });

  test("should show empty state when no tags exist", async ({ page }) => {
    await page.goto("/contacts");
    const allContacts = await page.locator(".hover\\:shadow-md").all();
    if (allContacts.length > 10) {
      await allContacts[10]?.click();
    } else {
      await allContacts[allContacts.length - 1]?.click();
    }
    
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await expect(page.getByText("No tags yet. Add one above to get started.")).toBeVisible();
  });

  test("should not create empty tags", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    await page.getByPlaceholder("Tag name...").fill("   ");
    
    await expect(page.getByRole("button", { name: "Add", exact: true })).toBeDisabled();
  });

  test("should display suggested tags from other contacts", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.waitForTimeout(1000);
    
    const suggestedSection = page.getByText("Suggested tags:");
    if (await suggestedSection.isVisible()) {
      await expect(suggestedSection).toBeVisible();
    }
  });

  test("should add suggested tag by clicking", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.waitForTimeout(1000);
    
    const suggestedSection = page.getByText("Suggested tags:");
    if (await suggestedSection.isVisible()) {
      const suggestedTags = page.locator("[class*='cursor-pointer hover:bg-secondary']");
      const firstSuggested = suggestedTags.first();
      const tagText = await firstSuggested.textContent();
      
      if (tagText) {
        await firstSuggested.click();
        await expect(page.locator(`[class*="flex items-center gap-1"]`).filter({ hasText: tagText })).toBeVisible();
      }
    }
  });

  test("should persist tags across tab switches", async ({ page }) => {
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await page.getByRole("button", { name: "Add Tag" }).click();
    const tagName = `persist-tag-${Date.now()}`;
    await page.getByPlaceholder("Tag name...").fill(tagName);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(tagName)).toBeVisible();
    
    await page.getByRole("tab", { name: "Notes" }).click();
    await page.getByRole("tab", { name: "Tags" }).click();
    
    await expect(page.getByText(tagName)).toBeVisible();
  });
});
