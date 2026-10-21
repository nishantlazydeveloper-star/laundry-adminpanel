import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Shirt,
  Truck,
  CreditCard,
  Bell,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  CircleHelp,
  X,
  Menu,
  WashingMachine,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { initialOrders, initialSettings, notifications } from "./data/demo";
import { Avatar, FocusScope, Toast } from "./components/UI";
import { AdminDialogs } from "./components/AdminDialogs";
import { OrdersTable } from "./components/OrdersTable";
import { DashboardView } from "./views/DashboardView";
import {
  CustomersView,
  DeliveryView,
  NotificationsView,
  PaymentsView,
  ServicesView,
  SettingsView,
} from "./views/WorkspaceViews";
import {
  downloadCsv,
  getCustomers,
  initials,
  resolvePage,
  transaction,
} from "./lib/admin";

const navigation = [
  ["Dashboard", LayoutDashboard],
  ["Orders", ShoppingBag],
  ["Customers", Users],
  ["Services", Shirt],
  ["Pickup & Delivery", Truck],
  ["Payments", CreditCard],
  ["Notifications", Bell],
  ["Settings", Settings],
];
const descriptions = {
  Orders: "Every order, a little more organized.",
  Customers: "Good service starts with knowing your people.",
  Services: "Thoughtful care for every kind of laundry.",
  "Pickup & Delivery": "From their doorstep to yours, and back again.",
  Payments: "A clear view of every dollar coming in.",
  Notifications: "You’re always in the loop.",
  Settings: "Make Laundro work your way.",
};
const searchLabels = {
  Dashboard: "Search dashboard orders",
  Orders: "Search orders",
  Customers: "Search customers",
  Services: "Search services",
  "Pickup & Delivery": "Search pickups and deliveries",
  Payments: "Search payments",
  Notifications: "Search notifications",
};

export default function App() {
  const [page, setPage] = useState(() => resolvePage(window.location.hash));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [popover, setPopover] = useState(null);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [month, setMonth] = useState("2026-10");
  const [settings, setSettings] = useState(initialSettings);
  const activePage = useRef(page);
  const searchRef = useRef(null);
  const headingRef = useRef(null);
  const menuRef = useRef(null);
  const firstRender = useRef(true);
  const customers = getCustomers(orders);
  const notify = (message) => setToast({ message, id: Date.now() });
  const closeOverlays = () => {
    setMobileOpen(false);
    setPopover(null);
    setModal(null);
  };
  const navigate = (name) => {
    closeOverlays();
    setSearch("");
    activePage.current = name;
    setPage(name);
    window.location.hash = encodeURIComponent(name);
  };
  const openModal = (next) => {
    setMobileOpen(false);
    setPopover(null);
    setModal(next);
  };
  const selectOrder = (order) => openModal({ type: "order", id: order.id });
  useEffect(() => {
    const handler = () => {
      const next = resolvePage(window.location.hash);
      if (next === activePage.current) return;
      activePage.current = next;
      setPage(next);
      setSearch("");
      setMobileOpen(false);
      setPopover(null);
      setModal(null);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const handler = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setMobileOpen(false);
    };
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const handler = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !modal &&
        !mobileOpen
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, mobileOpen]);

  const exportOrders = (records) => {
    downloadCsv(
      "laundro-orders.csv",
      [
        "Order ID",
        "Customer",
        "Email",
        "Service",
        "Items",
        "Date",
        "Amount (USD)",
        "Order status",
        "Payment status",
      ],
      records.map((order) => [
        order.id,
        order.name,
        order.email,
        order.service,
        order.items,
        order.date,
        order.amount.toFixed(2),
        order.status,
        order.payment,
      ]),
    );
    notify(
      `${records.length} ${records.length === 1 ? "order" : "orders"} exported.`,
    );
  };
  const exportPayments = (records) => {
    downloadCsv(
      "laundro-payments.csv",
      [
        "Transaction ID",
        "Order ID",
        "Customer",
        "Date",
        "Method",
        "Amount (USD)",
        "Payment status",
      ],
      records.map((order) => [
        transaction(order).id,
        order.id,
        order.name,
        order.date,
        transaction(order).method,
        order.amount.toFixed(2),
        order.payment,
      ]),
    );
    notify(`${records.length} payment records exported.`);
  };
  const createOrder = (order) => {
    setOrders((previous) => [order, ...previous]);
    setModal(null);
    setSearch("");
    setMonth("2026-10");
    notify(`Order #${order.id} created.`);
  };
  const updateStatus = (id, status) => {
    setOrders((previous) =>
      previous.map((order) => (order.id === id ? { ...order, status } : order)),
    );
    notify(`Order #${id} updated to ${status.toLowerCase()}.`);
  };
  const markRead = () => {
    setNotificationsRead(true);
    notify("All notifications marked as read.");
  };
  const admin = { initials: initials(settings.name), color: "admin-avatar" };
  const sidebarContent = (
    <>
      <a
        href="#Dashboard"
        className="brand"
        onClick={(event) => {
          event.preventDefault();
          navigate("Dashboard");
        }}
        aria-label="Laundro dashboard"
      >
        <span className="brand-symbol">
          <WashingMachine size={25} strokeWidth={1.8} />
        </span>
        <span>
          laundro<span className="brand-period">.</span>
          <small>ADMIN WORKSPACE</small>
        </span>
      </a>
      <button
        className="mobile-close icon-button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
      >
        <X size={20} />
      </button>
      <div className="workspace">
        <span className="workspace-icon">
          <Shirt size={18} />
        </span>
        <div>
          <strong title={settings.business}>{settings.business}</strong>
          <span>Business workspace</span>
        </div>
      </div>
      <span className="nav-caption">WORKSPACE</span>
      <nav aria-label="Main navigation">
        {navigation.map(([name, Icon], index) => (
          <button
            key={name}
            aria-current={page === name ? "page" : undefined}
            className={`nav-item ${page === name ? "active" : ""} ${index === 6 ? "nav-divider" : ""}`}
            onClick={() => navigate(name)}
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{name}</span>
            {name === "Orders" && (
              <span className="nav-count">{orders.length}</span>
            )}
            {name === "Notifications" && !notificationsRead && (
              <span className="nav-unread">
                <span className="sr-only">{notifications.length} unread</span>
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <span className="help-icon">
            <Sparkles size={19} />
          </span>
          <h3>A little help goes a long way.</h3>
          <p>We’re here for you and your business.</p>
          <button onClick={() => openModal({ type: "help" })}>
            Let’s talk <ArrowUpRight size={15} />
          </button>
          <div className="help-decoration" />
        </div>
        <button
          className="support-link"
          onClick={() => openModal({ type: "help" })}
        >
          <CircleHelp size={18} />
          Help & support
          <ExternalLink size={13} />
        </button>
        <div className="sidebar-foot">
          <span className="live-dot" />
          Demo workspace<span>v1.0</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to main content
      </a>
      {mobileOpen && (
        <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />
      )}
      {isMobile && mobileOpen ? (
        <FocusScope
          className="sidebar open"
          label="Workspace navigation"
          onClose={() => setMobileOpen(false)}
        >
          {sidebarContent}
        </FocusScope>
      ) : (
        <aside className="sidebar" inert={isMobile || Boolean(modal)}>
          {sidebarContent}
        </aside>
      )}
      <div className="main-shell" inert={Boolean(modal) || mobileOpen}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuRef}
              className="mobile-menu icon-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="header-actions">
            {page !== "Settings" && (
              <label className="global-search">
                <Search size={17} />
                <input
                  ref={searchRef}
                  value={search}
                  placeholder={isMobile ? "Search..." : "Search this view..."}
                  aria-label={searchLabels[page]}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search ? (
                  <button
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <kbd>⌘ K</kbd>
                )}
              </label>
            )}
            <div className="popover-anchor">
              <button
                className="notification-button icon-button"
                aria-label="Open notifications"
                aria-haspopup="dialog"
                aria-expanded={popover === "notifications"}
                onClick={() =>
                  setPopover((previous) =>
                    previous === "notifications" ? null : "notifications",
                  )
                }
              >
                <Bell size={20} />
                {!notificationsRead && <i />}
              </button>
              {popover === "notifications" && (
                <FocusScope
                  className="popover notification-popover"
                  label="Notifications preview"
                  dialog={false}
                  onClose={() => setPopover(null)}
                >
                  <div className="popover-title">
                    <strong>Notifications</strong>
                    <button
                      disabled={notificationsRead}
                      className="text-link"
                      onClick={markRead}
                    >
                      {notificationsRead ? "All read" : "Mark all read"}
                    </button>
                  </div>
                  {notifications.map((notification) => (
                    <button
                      className="notification-mini"
                      key={notification.title}
                      onClick={() => navigate("Notifications")}
                    >
                      <span className="mini-icon">
                        <Bell size={15} />
                      </span>
                      <span>
                        <strong>{notification.title}</strong>
                        <small>{notification.time}</small>
                      </span>
                      {!notificationsRead && <span className="nav-unread" />}
                    </button>
                  ))}
                  <button
                    className="popover-footer"
                    onClick={() => navigate("Notifications")}
                  >
                    View all notifications <ArrowRight size={14} />
                  </button>
                </FocusScope>
              )}
            </div>
            <span className="header-divider" />
            <div className="popover-anchor">
              <button
                className="profile-button"
                aria-label={`${settings.name}, administrator profile`}
                aria-haspopup="dialog"
                aria-expanded={popover === "profile"}
                onClick={() =>
                  setPopover((previous) =>
                    previous === "profile" ? null : "profile",
                  )
                }
              >
                <Avatar person={admin} />
                <span>
                  <strong>{settings.name}</strong>
                  <small>Administrator</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {popover === "profile" && (
                <FocusScope
                  className="popover profile-popover"
                  label="Administrator profile"
                  dialog={false}
                  onClose={() => setPopover(null)}
                >
                  <strong>{settings.name}</strong>
                  <small>{settings.email}</small>
                  <button onClick={() => navigate("Settings")}>
                    <Settings size={16} />
                    Account settings
                  </button>
                  <button onClick={() => openModal({ type: "help" })}>
                    <CircleHelp size={16} />
                    Contact support
                  </button>
                </FocusScope>
              )}
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                LET’S MAKE TODAY A FRESH START
              </div>
              <h1 ref={headingRef} tabIndex={-1}>
                {page === "Dashboard" ? (
                  <>
                    Good morning, {settings.name.split(" ")[0]}{" "}
                    <span className="wave" aria-hidden="true">
                      ✦
                    </span>
                  </>
                ) : (
                  page
                )}
              </h1>
              <p>
                {page === "Dashboard"
                  ? "Here’s what’s happening with your laundry business today."
                  : descriptions[page]}
              </p>
            </div>
            <div className="page-actions">
              {page === "Dashboard" && (
                <label className="date-select">
                  <CalendarDays size={15} />
                  <select
                    aria-label="Dashboard date range"
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                  >
                    <option value="2026-10">Oct 1 – Oct 31, 2026</option>
                    <option value="2026-09">Sep 1 – Sep 30, 2026</option>
                  </select>
                  <ChevronDown size={13} />
                </label>
              )}
              {["Dashboard", "Orders"].includes(page) && (
                <button
                  className="button primary"
                  onClick={() => openModal({ type: "new" })}
                >
                  <Plus size={17} />
                  New order
                </button>
              )}
            </div>
          </div>
          {page === "Dashboard" && (
            <DashboardView
              orders={orders}
              month={month}
              search={search}
              onSearchChange={setSearch}
              navigate={navigate}
              onSelect={selectOrder}
            />
          )}
          {page === "Orders" && (
            <OrdersTable
              full
              orders={orders}
              search={search}
              onSearchChange={setSearch}
              onSelect={selectOrder}
              onExport={exportOrders}
            />
          )}
          {page === "Customers" && (
            <CustomersView
              customers={customers}
              search={search}
              clearSearch={() => setSearch("")}
              onSelect={(customer) =>
                openModal({ type: "customer", email: customer.email })
              }
            />
          )}
          {page === "Services" && (
            <ServicesView
              search={search}
              clearSearch={() => setSearch("")}
              onSelect={(service) =>
                openModal({ type: "service", name: service.name })
              }
            />
          )}
          {page === "Pickup & Delivery" && (
            <DeliveryView
              orders={orders}
              search={search}
              clearSearch={() => setSearch("")}
              onSelect={selectOrder}
              timezone={settings.timezone}
            />
          )}
          {page === "Payments" && (
            <PaymentsView
              orders={orders}
              search={search}
              clearSearch={() => setSearch("")}
              onExport={exportPayments}
            />
          )}
          {page === "Notifications" && (
            <NotificationsView
              notifications={notifications}
              read={notificationsRead}
              search={search}
              clearSearch={() => setSearch("")}
              onRead={markRead}
            />
          )}
          {page === "Settings" && (
            <SettingsView
              settings={settings}
              onSave={(next) => {
                setSettings(next);
                notify("Your workspace settings have been saved.");
              }}
            />
          )}
          <footer className="main-footer">
            <span>© 2026 Laundro. Made for a fresher everyday.</span>
            <span>
              <span className="live-dot" />A fresh perspective on your business{" "}
              <Sparkles size={12} />
            </span>
          </footer>
        </main>
      </div>
      <AdminDialogs
        modal={modal}
        orders={orders}
        customers={customers}
        onClose={() => setModal(null)}
        onModal={setModal}
        onCreate={createOrder}
        onStatusChange={updateStatus}
      />
      {toast && <Toast key={toast.id} message={toast.message} />}
    </div>
  );
}
