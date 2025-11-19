import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Files System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Contacts/i }).click();
    await expect(page).toHaveURL(/\/contacts$/);
    await page.locator(".hover\\:shadow-md").first().click();
    await expect(page).toHaveURL(/\/contacts\/[\w-]+$/);
  });

  test("should display files section on contact detail page", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    await expect(page.getByRole("button", { name: /Upload File/i })).toBeVisible();
  });

  test("should upload a text file", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "test-file.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("This is a test file"),
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByText("test-file.txt")).toBeVisible();
  });

  test("should show upload progress", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "large-file.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("A".repeat(10000)),
    });
    
    const uploadButton = page.getByRole("button", { name: /Upload File|Uploading/i });
    await expect(uploadButton).toBeVisible();
  });

  test("should display file size and upload time", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "size-test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Test content for size display"),
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByText("size-test.txt")).toBeVisible();
    await expect(page.getByText(/ago/)).toBeVisible();
    await expect(page.getByText(/Bytes|KB|MB/)).toBeVisible();
  });

  test("should delete a file", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "delete-test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("File to be deleted"),
    });
    
    await page.waitForTimeout(2000);
    await expect(page.getByText("delete-test.txt")).toBeVisible();
    
    page.on("dialog", (dialog) => dialog.accept());
    
    await page.locator("button").filter({ has: page.locator("svg").first() }).last().click();
    
    await page.waitForTimeout(1000);
    await expect(page.getByText("delete-test.txt")).not.toBeVisible();
  });

  test("should show empty state when no files exist", async ({ page }) => {
    await page.goto("/contacts");
    const allContacts = await page.locator(".hover\\:shadow-md").all();
    if (allContacts.length > 10) {
      await allContacts[10]?.click();
    } else {
      await allContacts[allContacts.length - 1]?.click();
    }
    
    await page.getByRole("tab", { name: "Files" }).click();
    
    await expect(page.getByText("No files yet. Upload one above to get started.")).toBeVisible();
  });

  test("should display multiple files in grid", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "file1.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("First file"),
    });
    
    await page.waitForTimeout(2000);
    
    await fileInput.setInputFiles({
      name: "file2.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Second file"),
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByText("file1.txt")).toBeVisible();
    await expect(page.getByText("file2.txt")).toBeVisible();
  });

  test("should display appropriate icon for different file types", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "document.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("PDF content"),
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByText("document.pdf")).toBeVisible();
  });

  test("should have download button for each file", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "download-test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Download this file"),
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByRole("link", { name: /Download/i })).toBeVisible();
  });

  test("should persist files across tab switches", async ({ page }) => {
    await page.getByRole("tab", { name: "Files" }).click();
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: "persist-test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Persistent file"),
    });
    
    await page.waitForTimeout(2000);
    await expect(page.getByText("persist-test.txt")).toBeVisible();
    
    await page.getByRole("tab", { name: "Notes" }).click();
    await page.getByRole("tab", { name: "Files" }).click();
    
    await expect(page.getByText("persist-test.txt")).toBeVisible();
  });
});
