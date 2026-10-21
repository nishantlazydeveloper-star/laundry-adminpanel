export const orders = [
  {
    id: "LND-1028",
    name: "Olivia Rhye",
    email: "olivia.rhye@gmail.com",
    initials: "OR",
    color: "peach",
    service: "Wash & Fold",
    items: "8 items",
    date: "Oct 21, 2026",
    amount: 24.0,
    status: "In progress",
    payment: "Paid",
  },
  {
    id: "LND-1027",
    name: "Phoenix Baker",
    email: "phoenix.baker@gmail.com",
    initials: "PB",
    color: "purple",
    service: "Dry Cleaning",
    items: "3 items",
    date: "Oct 21, 2026",
    amount: 42.5,
    status: "Ready for delivery",
    payment: "Paid",
  },
  {
    id: "LND-1026",
    name: "Lana Steiner",
    email: "lana.steiner@gmail.com",
    initials: "LS",
    color: "pink",
    service: "Wash & Iron",
    items: "6 items",
    date: "Oct 21, 2026",
    amount: 32.0,
    status: "Pending",
    payment: "Pending",
  },
  {
    id: "LND-1025",
    name: "Demi Wilkinson",
    email: "demi.wilkinson@gmail.com",
    initials: "DW",
    color: "green",
    service: "Wash & Fold",
    items: "12 items",
    date: "Oct 20, 2026",
    amount: 36.0,
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "LND-1024",
    name: "Drew Cano",
    email: "drew.cano@gmail.com",
    initials: "DC",
    color: "blue",
    service: "Premium Laundry",
    items: "5 items",
    date: "Oct 20, 2026",
    amount: 54.0,
    status: "Delivered",
    payment: "Paid",
  },
];
export const revenue = [
  { day: "Mon", current: 960, previous: 650 },
  { day: "Tue", current: 1480, previous: 940 },
  { day: "Wed", current: 1260, previous: 810 },
  { day: "Thu", current: 2130, previous: 1250 },
  { day: "Fri", current: 1810, previous: 1120 },
  { day: "Sat", current: 2630, previous: 1730 },
  { day: "Sun", current: 2440, previous: 1490 },
];
export const statuses = [
  { name: "Delivered", value: 856, color: "#2563eb" },
  { name: "In progress", value: 248, color: "#7ba6ff" },
  { name: "Pending", value: 102, color: "#ffcd75" },
  { name: "Cancelled", value: 42, color: "#e8edf5" },
];
export const notifications = [
  {
    title: "A fresh order just landed",
    body: "Olivia Rhye placed order #LND-1028 for Wash & Fold.",
    time: "2 minutes ago",
    type: "order",
  },
  {
    title: "Pickup scheduled",
    body: "Lana Steiner’s pickup is scheduled for today, 2:00–3:00 PM.",
    time: "15 minutes ago",
    type: "pickup",
  },
  {
    title: "Payment received",
    body: "$42.50 received for order #LND-1027.",
    time: "32 minutes ago",
    type: "payment",
  },
];
export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export const serviceCatalog = [
  {
    name: "Wash & Fold",
    price: 3,
    unit: "per item",
    desc: "Fresh, fluffy, and neatly folded.",
    icon: "wash",
    color: "blue",
  },
  {
    name: "Dry Cleaning",
    price: 14,
    unit: "per item",
    desc: "Expert care for your special pieces.",
    icon: "sparkles",
    color: "purple",
  },
  {
    name: "Wash & Iron",
    price: 5.5,
    unit: "per item",
    desc: "Everyday essentials, perfectly pressed.",
    icon: "shirt",
    color: "orange",
  },
  {
    name: "Premium Laundry",
    price: 10.8,
    unit: "per item",
    desc: "A little extra love for luxury fabrics.",
    icon: "package",
    color: "green",
  },
];

const routeDetails = [
  ["24 Maple Avenue, Downtown", "2026-10-21T08:30:00Z"],
  ["180 Park Street, Westside", "2026-10-21T09:30:00Z"],
  ["56 Oak Lane, Midtown", "2026-10-21T10:30:00Z"],
  ["12 Garden Road, Eastside", "2026-10-21T11:30:00Z"],
  ["72 Willow Drive, Northside", "2026-10-21T12:30:00Z"],
];
export const initialOrders = orders.map((order, index) => ({
  ...order,
  dateISO: `2026-10-${index < 3 ? "21" : "20"}`,
  address: routeDetails[index][0],
  pickupStart: routeDetails[index][1],
}));
export const initialSettings = {
  name: "Nishant Ingle",
  email: "admin@laundro.com",
  business: "Laundro HQ",
  phone: "+1 (415) 555-0128",
  currency: "USD",
  timezone: "Asia/Kolkata",
  emailNotifications: true,
};
