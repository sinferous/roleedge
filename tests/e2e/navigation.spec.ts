import { expect, test } from "@playwright/test";

const nav = ["Home", "Study abroad", "Career", "For institutions", "Blogs", "Resources", "About us"];

test("main navigation links to each section page", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const label of nav) {
    if (isMobile) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: label, exact: true }).click();
    } else {
      await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: label, exact: true }).click();
    }
    if (label === "Home") {
      await expect(page).toHaveURL(/\/$/);
      continue;
    }
    // Next keeps recently visited pages mounted but hidden, so only check what's visible.
    const crumb = page.getByRole("navigation", { name: "Breadcrumb" }).filter({ visible: true });
    await expect(crumb).toContainText(label === "Blogs" ? "Blog" : label);
    await expect(page.locator("h1").filter({ visible: true })).toHaveCount(1);
  }
});

test("mobile menu closes on Escape and returns focus", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
});

test("there is no horizontal scroll", async ({ page }) => {
  for (const route of ["/", "/book", "/institutions", "/blog/the-90-day-promotion-plan-how-to-fast-track-your-career"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(0);
  }
});
