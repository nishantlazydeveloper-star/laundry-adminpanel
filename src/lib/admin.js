export const ORDER_STATUSES = [
  "Pending",
  "In progress",
  "Ready for delivery",
  "Delivered",
  "Cancelled",
];
export const NAVIGATION = [
  "Dashboard",
  "Orders",
  "Customers",
  "Services",
  "Pickup & Delivery",
  "Payments",
  "Notifications",
  "Settings",
];
export const DEMO_DATE = "2026-10-21";

export function resolvePage(hash) {
  try {
    const page = decodeURIComponent(hash.replace(/^#/, ""));
    return NAVIGATION.includes(page) ? page : "Dashboard";
  } catch {
    return "Dashboard";
  }
}

export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

export function matchesSearch(record, query) {
  const text = Object.values(record)
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((word) => text.includes(word));
}

export function filterOrders(
  orders,
  query,
  status = "All orders",
  descending = true,
) {
  return orders
    .filter(
      (order) =>
        matchesSearch(order, query) &&
        (status === "All orders" || order.status === status),
    )
    .sort((a, b) =>
      descending
        ? Number(b.id.split("-")[1]) - Number(a.id.split("-")[1])
        : Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]),
    );
}

export function createOrder(values, orders, services) {
  const name = String(values.name || "")
    .trim()
    .replace(/\s+/g, " ");
  const email = String(values.email || "")
    .trim()
    .toLowerCase();
  const quantity = Number(values.items);
  const service = services.find((item) => item.name === values.service);
  if (!name) throw new Error("Enter a customer name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Enter a valid email address.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100)
    throw new Error("Enter a whole number of items between 1 and 100.");
  if (!service) throw new Error("Choose an available service.");
  const nextId =
    Math.max(1028, ...orders.map((order) => Number(order.id.split("-")[1]))) +
    1;
  return {
    id: `LND-${nextId}`,
    name,
    email,
    initials: initials(name),
    color: "blue",
    service: service.name,
    items: `${quantity} ${quantity === 1 ? "item" : "items"}`,
    date: "Oct 21, 2026",
    dateISO: DEMO_DATE,
    amount: Math.round(service.price * quantity * 100) / 100,
    status: "Pending",
    payment: "Pending",
    address: "Address to be confirmed",
    pickupStart: null,
  };
}

export function getCustomers(orders) {
  const customers = new Map();
  for (const order of [...orders].reverse()) {
    const key = order.email.toLowerCase();
    const customer = customers.get(key) || {
      ...order,
      orders: [],
      totalSpent: 0,
    };
    customer.orders.unshift(order);
    customer.totalSpent += order.amount;
    // Keep the most recent customer details while grouping by email.
    customer.name = order.name;
    customer.initials = initials(order.name);
    customers.set(key, customer);
  }
  return [...customers.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function csvCell(value) {
  let text = String(value ?? "");
  // Treat user-entered values as text in spreadsheet applications.
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildCsv(headers, rows) {
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}

export function downloadCsv(filename, headers, rows) {
  const url = URL.createObjectURL(
    new Blob([buildCsv(headers, rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function transaction(order) {
  const number = Number(order.id.split("-")[1]);
  return {
    id: `TXN-${number + 7000}`,
    method:
      number > 1028
        ? "Awaiting payment"
        : `${number % 2 ? "Mastercard" : "Visa"} •••• ${4242 + (1028 - number)}`,
  };
}
