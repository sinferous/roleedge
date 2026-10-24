import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/", "/study-abroad", "/career", "/institutions", "/blog", "/resources", "/about", "/stories", "/edgeai",
  "/services", "/services/mba-admissions", "/start", "/book", "/contact", "/faq", "/privacy", "/terms",
  "/blog/profitability-case-interview-complete-guide-with-examples", "/blog/category/consulting",
];

for (const route of routes) {
  test(`${route} renders, has one h1 and no accessibility violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/RoleEdge/);
    expect(await page.locator('link[rel="canonical"]').count()).toBeLessThanOrEqual(1);
    // Scroll through so below-the-fold reveals finish before the scan.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("unknown pages return 404 with a way home", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible();
});

test("old WordPress post URLs redirect permanently", async ({ request }) => {
  for (const path of ["/profitability-case-interview-complete-guide-with-examples", "/profitability-case-interview-complete-guide-with-examples/"]) {
    const first = await request.get(path, { maxRedirects: 0 });
    expect(first.status(), path).toBe(308);
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    expect(res.url()).toMatch(/\/blog\/profitability-case-interview-complete-guide-with-examples$/);
  }
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-powered-by"]).toBeUndefined();
});
