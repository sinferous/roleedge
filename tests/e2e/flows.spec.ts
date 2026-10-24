import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "../../playwright.config";

test.describe.configure({ mode: "serial" });

test("service tabs switch with the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.locator("#services").scrollIntoViewIfNeeded();
  const first = page.getByRole("tab", { name: /Study abroad/ });
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: /^Career/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#services").getByRole("tabpanel")).toContainText("Prepare for your next role.");
});

test("hero folders lead to their pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Explore RoleEdge" }).getByRole("link", { name: /For institutions/ }).click();
  await expect(page).toHaveURL(/\/institutions$/);
});

test("planner works by keyboard and sends nothing without consent to email", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => r.method() === "POST" && posts.push(r.url()));
  await page.goto("/start");
  const planner = page.locator("#planner");
  for (const answer of ["A move into consulting", "Already applying or preparing", "Within the next month"]) {
    await planner.getByRole("radio", { name: answer }).check();
    await planner.getByRole("button", { name: /Continue|See my next steps/ }).click();
  }
  await expect(planner.getByRole("heading", { name: "Make your preparation more deliberate." })).toBeFocused();
  await expect(planner.locator("ol li")).toHaveCount(3);
  expect(posts).toEqual([]);

  await planner.getByRole("button", { name: "Or email them to me" }).click();
  await planner.getByLabel("Email").fill("planner@example.com");
  await planner.getByRole("checkbox").check();
  await planner.getByRole("button", { name: "Send my steps" }).click();
  await expect(planner.getByText("Sent. Check your inbox")).toBeVisible();
});

test("contact form shows errors, then succeeds", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Please confirm you’re happy for us to contact you.")).toBeVisible();

  await page.getByLabel("Name").fill("E2E Contact");
  await page.getByLabel("Email").fill("contact@example.com");
  await page.getByLabel("What’s it about?").selectOption("consulting");
  await page.getByLabel(/Message/).fill("Preparing for MBB interviews.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Your message has arrived")).toBeVisible();
});

test("booking flow creates a request, never a confirmed booking", async ({ page }) => {
  await page.goto("/book?service=consulting-career-moves");
  await expect(page.getByRole("heading", { name: "Pick a time that suits you." })).toBeVisible();
  let slot = page.locator(".slot").first();
  if ((await slot.count()) === 0) {
    await page.getByRole("button", { name: "Next week" }).click();
    slot = page.locator(".slot").first();
  }
  await slot.click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("This sends a request, not a confirmed booking.")).toBeVisible();
  await page.getByLabel("Name").fill("E2E Booker");
  await page.getByLabel("Email").fill("booker@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request this time" }).click();
  await expect(page.getByRole("heading", { name: "Request received." })).toBeVisible();
});

test("institutions enquiry is pre-set to the institution topic", async ({ page }) => {
  await page.goto("/institutions");
  await expect(page.getByLabel("What’s it about?")).toHaveValue("institution");
});

test("admin requires sign-in and can triage the leads", async ({ page }) => {
  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Password").fill("wrong-password-000");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".form-error")).toContainText("don’t match");

  await page.getByLabel("Password").fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
  await expect(page.getByRole("link", { name: "E2E Contact" }).first()).toBeVisible();

  await page.getByRole("link", { name: "E2E Contact" }).first().click();
  await page.getByLabel("Lead status").selectOption("contacted");
  await page.getByRole("button", { name: "Update" }).last().click();
  await expect(page.locator(".admin-head .status-badge")).toHaveText("Contacted");
  await expect(page.getByText(/lead status changed/)).toBeVisible();

  await page.getByRole("link", { name: "Call requests" }).click();
  await expect(page.getByRole("link", { name: "E2E Booker" }).first()).toBeVisible();
});
