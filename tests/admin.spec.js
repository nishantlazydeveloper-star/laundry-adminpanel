import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const pages = [
  "Dashboard",
  "Orders",
  "Customers",
  "Services",
  "Pickup & Delivery",
  "Payments",
  "Notifications",
  "Settings",
];
async function navigate(page, name) {
  if (
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: false })
    .click();
  await expect(page.locator("h1")).toHaveText(
    name === "Dashboard" ? /Good morning/ : name,
  );
}
async function openOrder(page, id = "LND-1028") {
  await page.getByRole("button", { name: `#${id}`, exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("all views navigate with back/forward, search and empty states work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const name of pages) {
    await navigate(page, name);
    if (name !== "Settings") {
      const search = page.locator(".global-search input");
      await search.fill("zzzz-no-result");
      await expect(page.locator(".empty-state")).toBeVisible();
      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .first()
        .click();
      await expect(page.locator(".empty-state")).toHaveCount(0);
    }
  }
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("Notifications");
  await page.goForward();
  await expect(page.locator("h1")).toHaveText("Settings");
  await page.goto("/#%E0%A4%A");
  await expect(page.locator("h1")).toContainText("Good morning");
  expect(errors).toEqual([]);
});

test("search stays synchronized with table filters and selection, CSV contains filtered records", async ({
  page,
}) => {
  await page.goto("/#Orders");
  await page.locator(".global-search input").fill("olivia.rhye");
  await expect(
    page.getByRole("textbox", { name: "Search orders", exact: true }).last(),
  ).toHaveValue("olivia.rhye");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Filter order status" })
    .selectOption("Delivered");
  await expect(
    page.getByText("No matching orders", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page
    .getByRole("checkbox", { name: "Select all visible orders" })
    .check();
  await expect(page.locator("tbody input:checked")).toHaveCount(5);
  await page
    .getByRole("checkbox", { name: "Select LND-1028", exact: true })
    .uncheck();
  await expect(
    page.getByRole("checkbox", { name: "Select all visible orders" }),
  ).toHaveJSProperty("indeterminate", true);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export selected (4)" }).click();
  const download = await downloadPromise;
  const csv = await fs.readFile(await download.path(), "utf8");
  expect(csv).toContain('"LND-1027"');
  expect(csv).not.toContain('"LND-1028"');
  await openOrder(page);
  await page
    .getByLabel("Order status", { exact: true })
    .selectOption("Cancelled");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("combobox", { name: "Filter order status" })
    .selectOption("Cancelled");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Olivia Rhye");
});

test("new orders validate names, calculate totals, update routes and group existing customers", async ({
  page,
}) => {
  await page.goto("/#Orders");
  await page.getByRole("button", { name: "New order", exact: true }).click();
  await page.getByLabel("Customer name").fill("   ");
  await page.getByLabel("Email address").fill("olivia.rhye@gmail.com");
  await page.getByRole("button", { name: "Create order", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a customer name.");
  await page.getByLabel("Customer name").fill("Olivia Rhye");
  await page.getByLabel("Service", { exact: true }).selectOption("Wash & Iron");
  await page.getByLabel("Number of items").fill("3");
  await expect(page.locator(".order-estimate")).toContainText("$16.50");
  await page.getByRole("button", { name: "Create order", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await openOrder(page, "LND-1029");
  await page
    .getByLabel("Order status", { exact: true })
    .selectOption("Ready for delivery");
  await page.keyboard.press("Escape");
  await navigate(page, "Pickup & Delivery");
  const route = page.locator(".route-item").filter({ hasText: "#LND-1029" });
  await expect(route).toContainText("Ready for delivery");
  await expect(route).toContainText("Time to be confirmed");
  await navigate(page, "Customers");
  await expect(page.locator(".customer-card")).toHaveCount(5);
  await page
    .locator(".customer-card")
    .filter({ hasText: "Olivia Rhye" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("2");
  await expect(page.locator(".customer-order-history button")).toHaveCount(2);
});

test("settings save, reset, validation and profile updates survive view changes", async ({
  page,
}) => {
  await page.goto("/#Settings");
  await page.getByLabel("Full name").fill("Morgan Lee");
  await page.getByLabel("Business name").fill("   ");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Business name").fill("Fresh Laundry Studio");
  await page.getByLabel("Email address").fill("morgan@example.com");
  await page.getByLabel("Business phone").fill("+1 555 0100");
  await page.getByLabel("Timezone").selectOption("Europe/London");
  await page.getByRole("switch", { name: "Email notifications" }).uncheck();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).toBeDisabled();
  await navigate(page, "Pickup & Delivery");
  await expect(page.locator(".panel-heading")).toContainText("Europe/London");
  await navigate(page, "Settings");
  await expect(page.getByLabel("Full name")).toHaveValue("Morgan Lee");
  await expect(page.getByLabel("Business phone")).toHaveValue("+1 555 0100");
  await expect(
    page.getByRole("switch", { name: "Email notifications" }),
  ).not.toBeChecked();
  await page.getByLabel("Full name").fill("Temporary");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Morgan Lee");
  await page
    .getByRole("button", { name: "Morgan Lee, administrator profile" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("morgan@example.com");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("services preselect order form, payment exports have transaction columns, notification state stays in sync", async ({
  page,
}) => {
  await page.goto("/#Services");
  await page
    .getByRole("button", { name: "View Dry Cleaning details", exact: true })
    .click();
  await page.getByRole("button", { name: "Create an order" }).click();
  await expect(page.getByLabel("Service", { exact: true })).toHaveValue(
    "Dry Cleaning",
  );
  await page.keyboard.press("Escape");
  await navigate(page, "Payments");
  await page.locator(".global-search input").fill("Phoenix");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("laundro-payments.csv");
  const csv = await fs.readFile(await download.path(), "utf8");
  expect(csv).toContain('"Transaction ID"');
  expect(csv).toContain('"Phoenix Baker"');
  expect(csv).not.toContain('"Olivia Rhye"');
  await navigate(page, "Notifications");
  await page
    .getByRole("button", { name: "Mark all read", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "All read", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Open notifications", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("All read");
  await page.locator("h1").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`all views fit at ${width}px and navigation is accessible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    for (const name of pages) {
      await navigate(page, name);
      const layout = await page.evaluate(() => ({
        width: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll("body *")]
          .filter(
            (el) =>
              el.getBoundingClientRect().right > window.innerWidth + 1 &&
              !el.closest(".table-scroll, .sidebar"),
          )
          .slice(0, 12)
          .map(
            (el) =>
              `${el.tagName}.${el.className}: ${Math.round(el.getBoundingClientRect().right)}`,
          ),
      }));
      expect(
        layout.scroll <= layout.width,
        `${name}: ${JSON.stringify(layout)}`,
      ).toBe(true);
      const sidebar = page.getByRole("navigation", { name: "Main navigation" });
      if (width > 760)
        await expect(
          sidebar.getByRole("button", { name, exact: false }),
        ).toHaveAttribute("aria-current", "page");
    }
    if (width <= 760) {
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await expect(
        page.getByRole("dialog", { name: "Workspace navigation" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Open navigation", exact: true }),
      ).toBeFocused();
      await navigate(page, "Orders");
      await page
        .getByRole("button", { name: "New order", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Close dialog" }),
      ).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(
        page.getByRole("button", { name: "Create order", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "New order", exact: true }),
      ).toBeFocused();
    }
  });
}
