import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCsv,
  createOrder,
  filterOrders,
  getCustomers,
  initials,
  resolvePage,
  transaction,
} from "../src/lib/admin.js";
import { initialOrders, serviceCatalog } from "../src/data/demo.js";

test("navigation handles encoded paths, unknown routes, and malformed escapes", () => {
  assert.equal(resolvePage("#Pickup%20%26%20Delivery"), "Pickup & Delivery");
  assert.equal(resolvePage("#%E0%A4%A"), "Dashboard");
  assert.equal(resolvePage("#missing"), "Dashboard");
  assert.equal(initials("  Mary   Jane Watson  "), "MJ");
});
test("order creation validates input and uses unique IDs and rounded prices", () => {
  const values = {
    name: "  Mary   Watson  ",
    email: "MARY@example.com",
    service: "Wash & Iron",
    items: "3",
  };
  const order = createOrder(values, initialOrders, serviceCatalog);
  assert.equal(order.id, "LND-1029");
  assert.equal(order.amount, 16.5);
  assert.equal(order.name, "Mary Watson");
  assert.equal(order.email, "mary@example.com");
  assert.equal(
    createOrder(values, [order, ...initialOrders], serviceCatalog).id,
    "LND-1030",
  );
  for (const invalid of [
    { items: "1.5" },
    { items: "0" },
    { items: "101" },
    { name: "   " },
    { email: "bad" },
    { service: "missing" },
  ]) {
    assert.throws(() =>
      createOrder({ ...values, ...invalid }, initialOrders, serviceCatalog),
    );
  }
});
test("search includes email and status, combines with filters, and sorts numerically", () => {
  assert.equal(
    filterOrders(initialOrders, "  olivia.rhye  ")[0].id,
    "LND-1028",
  );
  assert.equal(
    filterOrders(initialOrders, "Lana pending", "Pending").length,
    1,
  );
  assert.equal(filterOrders(initialOrders, "Olivia", "Delivered").length, 0);
  const cancelled = { ...initialOrders[0], status: "Cancelled" };
  assert.equal(filterOrders([cancelled], "", "Cancelled").length, 1);
  assert.equal(
    filterOrders(initialOrders, "", "All orders", false)[0].id,
    "LND-1024",
  );
});
test("customers group repeated orders by email and retain spending and history", () => {
  const order = createOrder(
    {
      name: "Olivia Rhye",
      email: "OLIVIA.RHYE@gmail.com",
      service: "Wash & Fold",
      items: "2",
    },
    initialOrders,
    serviceCatalog,
  );
  const customers = getCustomers([order, ...initialOrders]);
  assert.equal(customers.length, 5);
  const olivia = customers.find((customer) => customer.email === order.email);
  assert.equal(olivia.orders.length, 2);
  assert.equal(olivia.totalSpent, 30);
  assert.equal(
    transaction(initialOrders[0]).id,
    transaction(initialOrders[0]).id,
  );
  assert.notEqual(transaction(order).id, transaction(initialOrders[0]).id);
});
test("CSV escapes quotes, commas, line breaks, and spreadsheet formulas", () => {
  const csv = buildCsv(
    ["Name", "Amount"],
    [
      ['Doe, "Jane"\nSmith', 12.5],
      ["=1+1", 0],
    ],
  );
  assert.ok(csv.startsWith('\uFEFF"Name","Amount"\r\n'));
  assert.ok(csv.includes('"Doe, ""Jane""\nSmith","12.5"'));
  assert.ok(csv.includes('"\'=1+1","0"'));
});
