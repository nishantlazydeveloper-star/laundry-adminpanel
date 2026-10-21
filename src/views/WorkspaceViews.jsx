import { useState } from "react";
import {
  ArrowUpRight,
  Sparkles,
  Package,
  Check,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Download,
  ShoppingBag,
} from "lucide-react";
import { Avatar, Badge, EmptyState, Panel, StatCard } from "../components/UI";
import { money, serviceCatalog } from "../data/demo";
import { initials, matchesSearch, transaction } from "../lib/admin";
import { serviceIcons } from "../lib/icons";

export function CustomersView({ customers, search, clearSearch, onSelect }) {
  const visible = customers.filter((customer) =>
    matchesSearch({ name: customer.name, email: customer.email }, search),
  );
  return (
    <Panel
      title="Your customer community"
      subtitle={`${customers.length} customers who trust you with their everyday essentials.`}
    >
      {visible.length ? (
        <div className="customer-grid">
          {visible.map((customer) => (
            <button
              className="customer-card"
              key={customer.email}
              onClick={() => onSelect(customer)}
            >
              <Avatar person={customer} size="large" />
              <h3>{customer.name}</h3>
              <p>{customer.email}</p>
              <div>
                <span>
                  {customer.orders.length}{" "}
                  {customer.orders.length === 1 ? "order" : "orders"}
                </span>
                <span>{money(customer.totalSpent)} spent</span>
              </div>
              <span className="customer-view">
                View customer <ArrowUpRight size={15} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No customers found"
          description="Try searching by customer name or email address."
          action="Clear search"
          onAction={clearSearch}
        />
      )}
    </Panel>
  );
}
export function ServicesView({ search, clearSearch, onSelect }) {
  const visible = serviceCatalog.filter((service) =>
    matchesSearch(service, search),
  );
  return (
    <>
      {visible.length ? (
        <div className="service-grid">
          {visible.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <section className="panel service-card" key={service.name}>
                <span className={`stat-icon ${service.color}`}>
                  <Icon size={25} />
                </span>
                <span className="service-active">
                  <span className="live-dot" />
                  Active
                </span>
                <h2>{service.name}</h2>
                <p>{service.desc}</p>
                <div className="service-price">
                  {money(service.price)} <small>/ item</small>
                </div>
                <div className="service-card-footer">
                  <span>
                    <Check size={14} />
                    Pickup & delivery available
                  </span>
                  <button
                    className="text-link"
                    aria-label={`View ${service.name} details`}
                    onClick={() => onSelect(service)}
                  >
                    View details
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <Panel title="Service catalog">
          <EmptyState
            title="No matching services"
            description="Try Wash & Fold, Dry Cleaning, Wash & Iron, or Premium Laundry."
            action="Clear search"
            onAction={clearSearch}
          />
        </Panel>
      )}
      <div className="info-banner">
        <Sparkles size={22} />
        <div>
          <strong>A little care makes a big difference.</strong>
          <p>
            Every service includes fabric-safe products and our freshness
            guarantee.
          </p>
        </div>
      </div>
    </>
  );
}
function routeTime(start, timezone) {
  if (!start) return "Time to be confirmed";
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
  return `${formatter.format(new Date(start))} – ${formatter.format(new Date(new Date(start).getTime() + 3600000))}`;
}
export function DeliveryView({
  orders,
  search,
  clearSearch,
  onSelect,
  timezone,
}) {
  const visible = orders.filter((order) => matchesSearch(order, search));
  return (
    <>
      <div className="delivery-summary">
        <div>
          <Truck size={23} />
          <strong>
            {orders.filter((order) => order.status === "Pending").length}
          </strong>
          <span>Awaiting pickup</span>
        </div>
        <div>
          <Package size={23} />
          <strong>
            {
              orders.filter((order) => order.status === "Ready for delivery")
                .length
            }
          </strong>
          <span>Ready for delivery</span>
        </div>
        <div>
          <Check size={23} />
          <strong>
            {orders.filter((order) => order.status === "Delivered").length}
          </strong>
          <span>Delivered orders</span>
        </div>
      </div>
      <Panel
        title="Today’s route"
        subtitle={`Wednesday, October 21 · Times in ${timezone.replaceAll("_", " ")}`}
      >
        <div className="route-list">
          {visible.map((order, index) => (
            <div className="route-item" key={order.id}>
              <span className="route-number">{index + 1}</span>
              <div className="route-person">
                <strong>{order.name}</strong>
                <span>
                  <MapPin size={13} />
                  {order.address}
                </span>
                <small>#{order.id}</small>
              </div>
              <div className="route-time">
                <Clock size={14} />
                {routeTime(order.pickupStart, timezone)}
              </div>
              <Badge status={order.status} />
              <button
                className="button secondary small"
                aria-label={`View route order ${order.id}`}
                onClick={() => onSelect(order)}
              >
                View order
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
        {!visible.length && (
          <EmptyState
            title="No matching pickups or deliveries"
            description="Search by customer, address, order ID, or status."
            action="Clear search"
            onAction={clearSearch}
          />
        )}
      </Panel>
    </>
  );
}
export function PaymentsView({ orders, search, clearSearch, onExport }) {
  const visible = orders.filter((order) =>
    matchesSearch({ ...order, ...transaction(order) }, search),
  );
  const paid = orders.filter((order) => order.payment === "Paid");
  const pending = orders.filter((order) => order.payment === "Pending");
  return (
    <>
      <div className="payment-stats">
        <StatCard
          label="Total collected"
          value={money(paid.reduce((sum, order) => sum + order.amount, 0))}
          change="18.6%"
          icon={CreditCard}
          color="green"
          points="0,35 25,25 50,28 75,12 100,3"
        />
        <StatCard
          label="Pending payments"
          value={money(pending.reduce((sum, order) => sum + order.amount, 0))}
          change="6.4%"
          icon={Clock}
          color="orange"
          points="0,35 25,25 50,28 75,12 100,3"
        />
        <StatCard
          label="Successful transactions"
          value={paid.length}
          change="12.4%"
          icon={Check}
          color="blue"
          points="0,35 25,25 50,28 75,12 100,3"
        />
      </div>
      <Panel
        title="Recent transactions"
        subtitle="Payments for the orders in this demo workspace."
        action={
          <button
            className="button secondary small"
            disabled={!visible.length}
            onClick={() => onExport(visible)}
          >
            <Download size={15} />
            Export report
          </button>
        }
      >
        <div
          className="table-scroll"
          role="region"
          aria-label="Payment transactions"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                {[
                  "Transaction",
                  "Customer",
                  "Date",
                  "Method",
                  "Amount",
                  "Status",
                ].map((title) => (
                  <th scope="col" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{transaction(order).id}</td>
                  <td>
                    <div className="customer-cell">
                      <Avatar person={order} />
                      <strong>{order.name}</strong>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <span className="payment-method">
                      <CreditCard size={16} />
                      {transaction(order).method}
                    </span>
                  </td>
                  <td className="amount">{money(order.amount)}</td>
                  <td>
                    <Badge status={order.payment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <EmptyState
            title="No matching payments"
            description="Try a customer name, transaction ID, or payment status."
            action="Clear search"
            onAction={clearSearch}
          />
        )}
      </Panel>
    </>
  );
}
export function NotificationsView({
  notifications,
  read,
  search,
  clearSearch,
  onRead,
}) {
  const visible = notifications.filter((notification) =>
    matchesSearch(notification, search),
  );
  return (
    <Panel
      title="Your latest updates"
      subtitle={
        read
          ? "You’re all caught up."
          : `You have ${notifications.length} new updates.`
      }
      action={
        <button
          className="button secondary small"
          disabled={read}
          onClick={onRead}
        >
          <Check size={15} />
          {read ? "All read" : "Mark all read"}
        </button>
      }
    >
      <div className="notification-list">
        {visible.map((notification) => {
          const Icon =
            notification.type === "order"
              ? ShoppingBag
              : notification.type === "pickup"
                ? Truck
                : CreditCard;
          const color =
            notification.type === "order"
              ? "blue"
              : notification.type === "pickup"
                ? "orange"
                : "green";
          return (
            <article
              className={`notification-item ${!read ? "unread" : ""}`}
              key={notification.title}
            >
              <span className={`stat-icon ${color}`}>
                <Icon size={21} />
              </span>
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.body}</p>
                <small>{notification.time}</small>
              </div>
              {!read && (
                <span className="nav-unread">
                  <span className="sr-only">Unread</span>
                </span>
              )}
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <EmptyState
          title="No matching notifications"
          description="Try searching for an order, pickup, or payment update."
          action="Clear search"
          onAction={clearSearch}
        />
      )}
    </Panel>
  );
}
export function SettingsView({ settings, onSave }) {
  const [draft, setDraft] = useState(settings);
  const [error, setError] = useState("");
  const update = (event) => {
    const { name, value, checked, type } = event.target;
    setDraft((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const submit = (event) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.business.trim()) {
      setError("Full name and business name cannot be blank.");
      return;
    }
    const next = {
      ...draft,
      name: draft.name.trim().replace(/\s+/g, " "),
      email: draft.email.trim(),
      business: draft.business.trim(),
      phone: draft.phone.trim(),
    };
    onSave(next);
    setDraft(next);
    setError("");
  };
  return (
    <Panel
      title="Workspace settings"
      subtitle="The details that make this space yours."
    >
      <form className="settings-form" onSubmit={submit}>
        <div className="settings-profile">
          <Avatar
            person={{
              initials: initials(settings.name),
              color: "admin-avatar",
            }}
            size="large"
          />
          <div>
            <strong>Administrator profile</strong>
            <p>Your account and business preferences</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Full name
            <input
              name="name"
              value={draft.name}
              onChange={update}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              name="email"
              value={draft.email}
              onChange={update}
              maxLength={120}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Business name
            <input
              name="business"
              value={draft.business}
              onChange={update}
              maxLength={80}
              autoComplete="organization"
              required
            />
          </label>
          <label>
            Business phone
            <input
              name="phone"
              type="tel"
              value={draft.phone}
              onChange={update}
              autoComplete="tel"
              maxLength={30}
            />
          </label>
          <label>
            Currency
            <select
              name="currency"
              aria-label="Currency"
              value={draft.currency}
              onChange={update}
              aria-describedby="currency-note"
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
            </select>
            <small id="currency-note">Demo prices are listed in INR (₹).</small>
          </label>
          <label>
            Timezone
            <select name="timezone" value={draft.timezone} onChange={update}>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </label>
        </div>
        <div className="settings-toggle">
          <div>
            <strong>Email notifications</strong>
            <p>Get updates about new orders and payments.</p>
          </div>
          <input
            type="checkbox"
            role="switch"
            aria-checked={draft.emailNotifications}
            className="toggle"
            name="emailNotifications"
            checked={draft.emailNotifications}
            onChange={update}
            aria-label="Email notifications"
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="settings-actions">
          <span className="settings-save-note" role="status">
            {dirty
              ? "You have unsaved changes."
              : "All changes saved for this session."}
          </span>
          <button
            className="button secondary"
            type="button"
            disabled={!dirty}
            onClick={() => {
              setDraft(settings);
              setError("");
            }}
          >
            Reset
          </button>
          <button className="button primary" disabled={!dirty} type="submit">
            Save changes
            <Check size={16} />
          </button>
        </div>
      </form>
    </Panel>
  );
}
