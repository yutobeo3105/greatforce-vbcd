import { test, expect } from "@playwright/test";

test.describe("Notes System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Contacts/i }).click();
    await expect(page).toHaveURL(/\/contacts$/);
  });

  test("should display notes section on contact detail page", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    await expect(page).toHaveURL(/\/contacts\/[\w-]+$/);
    
    await expect(page.getByRole("tab", { name: "Notes" })).toBeVisible();
    await expect(page.getByPlaceholder("Add a note...")).toBeVisible();
  });

  test("should create a new note", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    const noteContent = `Test note created at ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(noteContent);
    await page.getByRole("button", { name: "Add Note" }).click();
    
    await expect(page.getByText(noteContent)).toBeVisible();
    await expect(page.getByText(/ago/)).toBeVisible();
  });

  test("should edit an existing note", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    const originalNote = `Original note ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(originalNote);
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText(originalNote)).toBeVisible();
    
    await page.getByRole("button", { name: "Edit" }).first().click();
    
    const updatedNote = `Updated note ${Date.now()}`;
    await page.getByRole("textbox").nth(1).fill(updatedNote);
    await page.getByRole("button", { name: "Save" }).click();
    
    await expect(page.getByText(updatedNote)).toBeVisible();
    await expect(page.getByText(originalNote)).not.toBeVisible();
    await expect(page.getByText("(edited)")).toBeVisible();
  });

  test("should cancel editing a note", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    const originalNote = `Note to cancel ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(originalNote);
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText(originalNote)).toBeVisible();
    
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox").nth(1).fill("This should be cancelled");
    await page.getByRole("button", { name: "Cancel" }).click();
    
    await expect(page.getByText(originalNote)).toBeVisible();
    await expect(page.getByText("This should be cancelled")).not.toBeVisible();
  });

  test("should delete a note", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    const noteToDelete = `Note to delete ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(noteToDelete);
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText(noteToDelete)).toBeVisible();
    
    await page.getByRole("button", { name: "Delete" }).first().click();
    
    await expect(page.getByText(noteToDelete)).not.toBeVisible();
  });

  test("should show empty state when no notes exist", async ({ page }) => {
    const allContacts = await page.locator(".hover\\:shadow-md").all();
    if (allContacts.length > 10) {
      await allContacts[10]?.click();
    } else {
      await allContacts[allContacts.length - 1]?.click();
    }
    
    await expect(page.getByText("No notes yet. Add one above to get started.")).toBeVisible();
  });

  test("should not create empty notes", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    await page.getByPlaceholder("Add a note...").fill("   ");
    
    await expect(page.getByRole("button", { name: "Add Note" })).toBeDisabled();
  });

  test("should display multiple notes in chronological order", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    const note1 = `First note ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(note1);
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText(note1)).toBeVisible();
    
    await page.waitForTimeout(1000);
    
    const note2 = `Second note ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(note2);
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText(note2)).toBeVisible();
    
    const notes = page.locator("[class*='p-4']").filter({ hasText: "ago" });
    await expect(notes.first()).toContainText(note2);
  });

  test("should switch between tabs while preserving notes", async ({ page }) => {
    await page.locator(".hover\\:shadow-md").first().click();
    
    const testNote = `Tab switch test ${Date.now()}`;
    await page.getByPlaceholder("Add a note...").fill(testNote);
    await page.getByRole("button", { name: "Add Note" }).click();
    await expect(page.getByText(testNote)).toBeVisible();
    
    await page.getByRole("tab", { name: "Activities" }).click();
    await expect(page.getByText(testNote)).not.toBeVisible();
    
    await page.getByRole("tab", { name: "Notes" }).click();
    await expect(page.getByText(testNote)).toBeVisible();
  });
});
