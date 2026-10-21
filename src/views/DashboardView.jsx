import { lazy, Suspense } from "react";
import {
  ArrowRight,
  CreditCard,
  Package,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { Panel, StatCard, TextLink } from "../components/UI";
import { OrdersTable } from "../components/OrdersTable";
import { initialOrders, statuses } from "../data/demo";
import { getCustomers } from "../lib/admin";
const RevenueChart = lazy(() =>
  import("../components/Charts").then((module) => ({
    default: module.RevenueChart,
  })),
);
const StatusChart = lazy(() =>
  import("../components/Charts").then((module) => ({
    default: module.StatusChart,
  })),
);

export function DashboardView({
  orders,
  month,
  search,
  onSearchChange,
  navigate,
  onSelect,
}) {
  const september = month === "2026-09";
  const additions = orders.filter(
    (order) => !initialOrders.some((initial) => initial.id === order.id),
  );
  const customersAdded =
    getCustomers(orders).length - getCustomers(initialOrders).length;
  const pending = orders.filter((order) => order.status === "Pending").length;
  const delivered = orders.filter(
    (order) => order.status === "Delivered",
  ).length;
  const recent = orders.filter((order) => order.dateISO.startsWith(month));
  const overview = statuses.map((status) => {
    const base = september
      ? Math.round(status.value * (1089 / 1248))
      : status.value;
    const count = (list) =>
      list.filter((order) =>
        status.name === "In progress"
          ? ["In progress", "Ready for delivery"].includes(order.status)
          : order.status === status.name,
      ).length;
    return {
      ...status,
      value: base + (september ? 0 : count(orders) - count(initialOrders)),
    };
  });
  return (
    <>
      <div className="stats-grid">
        <StatCard
          label="Total orders"
          value={(september ? 1089 : 1248 + additions.length).toLocaleString()}
          change="12.8%"
          icon={ShoppingBag}
          color="blue"
          points="0,32 12,28 22,31 34,20 46,24 58,16 70,20 83,7 100,3"
        />
        <StatCard
          label="Total revenue"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(
            september
              ? 21364
              : 24580 +
                  additions
                    .filter((order) => order.payment === "Paid")
                    .reduce((sum, order) => sum + order.amount, 0),
          )}
          change="18.6%"
          icon={CreditCard}
          color="green"
          points="0,33 13,30 24,34 36,21 48,25 60,14 73,18 85,8 100,3"
        />
        <StatCard
          label="Total customers"
          value={september ? "791" : (856 + customersAdded).toLocaleString()}
          change="8.2%"
          icon={Users}
          color="purple"
          points="0,34 14,29 25,31 38,20 50,24 62,15 74,17 86,8 100,4"
        />
        <StatCard
          label="Pending pickups"
          value={
            september
              ? "19"
              : String(
                  24 +
                    pending -
                    initialOrders.filter((order) => order.status === "Pending")
                      .length,
                )
          }
          change="4.2%"
          icon={Truck}
          color="orange"
          points="0,31 12,25 25,29 38,18 50,23 63,13 75,18 87,7 100,3"
        />
      </div>
      <Suspense
        fallback={
          <div className="chart-loading" role="status">
            Preparing your business overview…
          </div>
        }
      >
        <div className="charts-grid">
          <RevenueChart key={`revenue-${month}`} month={month} />
          <StatusChart key={`status-${month}`} data={overview} />
        </div>
      </Suspense>
      <OrdersTable
        key={month}
        orders={recent}
        search={search}
        onSearchChange={onSearchChange}
        onSelect={onSelect}
        onViewAll={() => navigate("Orders")}
      />
      <div className="bottom-grid">
        <Panel
          title="Today’s pickups"
          subtitle="Fresh starts, right on schedule."
          action={
            <TextLink onClick={() => navigate("Pickup & Delivery")}>
              Manage pickups
            </TextLink>
          }
        >
          <div className="pickup-preview">
            <div className="pickup-preview-icon">
              <Truck size={23} />
            </div>
            <div>
              <strong>
                {pending} {pending === 1 ? "pickup" : "pickups"} awaiting
                collection
              </strong>
              <p>
                {pending
                  ? "View your route for scheduled pickup times."
                  : "All demo pickups are taken care of."}
              </p>
            </div>
            <div className="driver-avatars">
              <span>JR</span>
              <span>MK</span>
              <span>+2</span>
            </div>
            <span className="on-track">
              <span className="live-dot" />
              On track
            </span>
          </div>
        </Panel>
        <div className="fresh-card">
          <div className="fresh-copy">
            <span>A LITTLE CLEANER. A LITTLE BETTER.</span>
            <h3>Great service. Happy customers.</h3>
            <p>You’ve delivered {delivered} fresh starts in this workspace.</p>
            <button onClick={() => navigate("Customers")}>
              Meet your customers <ArrowRight size={15} />
            </button>
          </div>
          <div className="fresh-art">
            <Shirt size={66} strokeWidth={1.1} />
            <Sparkles size={24} />
          </div>
        </div>
      </div>
      <p className="dashboard-data-note">
        <Package size={12} />
        Monthly totals include demo history. Order lists show the records
        available in this workspace.
      </p>
    </>
  );
}
