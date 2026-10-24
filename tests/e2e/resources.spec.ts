import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the first download asks for a name and email, later ones start straight away", async ({ page }) => {
  await page.goto("/resources");
  await page.getByRole("button", { name: /^Download MBA admissions checklist/ }).click();
  const dialog = page.getByRole("dialog", { name: "MBA admissions checklist" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Download the PDF" }).click();
  await expect(dialog.getByText("Enter your name.")).toBeVisible();
  const results = await new AxeBuilder({ page }).include(".download-dialog").analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  await dialog.getByRole("textbox", { name: "Name" }).fill("Test Person");
  await dialog.getByRole("textbox", { name: "Email" }).fill("resource-test@example.com");
  await dialog.getByRole("checkbox").check();
  const [first] = await Promise.all([page.waitForEvent("download"), dialog.getByRole("button", { name: "Download the PDF" }).click()]);
  expect(first.suggestedFilename()).toBe("mba-admissions-checklist.pdf");
  await expect(dialog.getByRole("status")).toContainText("Your download has started");
  await page.keyboard.press("Escape");

  const [second] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /^Download Case math workbook/ }).click()]);
  expect(second.suggestedFilename()).toBe("case-math-workbook.pdf");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
