import { useRef, useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUpRight,
  Download,
  X,
} from "lucide-react";
import { Avatar, Badge, EmptyState, Panel, TextLink } from "./UI";
import { money } from "../data/demo";
import { filterOrders, ORDER_STATUSES } from "../lib/admin";

export function OrdersTable({
  orders,
  onSelect,
  onViewAll,
  full = false,
  search = "",
  onSearchChange,
  onExport,
}) {
  const [status, setStatus] = useState("All orders");
  const [descending, setDescending] = useState(true);
  const [selected, setSelected] = useState([]);
  const selectAll = useRef(null);
  const visible = filterOrders(orders, search, status, descending);
  const selectedVisible = visible.filter((order) =>
    selected.includes(order.id),
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  useEffect(() => {
    if (selectAll.current)
      selectAll.current.indeterminate =
        selectedVisible.length > 0 && !allSelected;
  }, [selectedVisible.length, allSelected]);
  const toggleAll = () =>
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !visible.some((order) => order.id === id))
        : [...new Set([...prev, ...visible.map((order) => order.id)])],
    );
  const reset = () => {
    setStatus("All orders");
    onSearchChange("");
    setSelected([]);
  };
  return (
    <Panel
      title={full ? "All orders" : "Recent orders"}
      subtitle={
        full
          ? "Keep every order moving, from pickup to doorstep."
          : "The latest loads keeping your business moving."
      }
      className="orders-panel"
      action={
        full ? (
          <button
            className="button secondary small"
            disabled={!visible.length}
            onClick={() =>
              onExport(selectedVisible.length ? selectedVisible : visible)
            }
          >
            <Download size={14} />
            {selectedVisible.length
              ? `Export selected (${selectedVisible.length})`
              : "Export results"}
          </button>
        ) : (
          <TextLink onClick={onViewAll}>View all orders</TextLink>
        )
      }
    >
      <div className="table-toolbar">
        <div
          className="table-tabs"
          role="group"
          aria-label="Quick order status filters"
        >
          {[
            ["All orders", "All orders"],
            ["In progress", "In progress"],
            ["Delivered", "Completed"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={status === value}
              className={status === value ? "selected" : ""}
              onClick={() => setStatus(value)}
            >
              {label}
              {value === "All orders" && <span>{orders.length}</span>}
            </button>
          ))}
        </div>
        <div className="table-tools">
          <label className="table-search">
            <Search size={15} />
            <input
              placeholder="Search orders..."
              aria-label="Search orders"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Clear order search"
              >
                <X size={13} />
              </button>
            )}
          </label>
          <label
            className={`filter-button ${status !== "All orders" ? "has-filter" : ""}`}
          >
            <SlidersHorizontal size={14} />
            <select
              aria-label="Filter order status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["All orders", ...ORDER_STATUSES].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <span>{status === "All orders" ? "Filters" : status}</span>
          </label>
        </div>
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Orders table"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">
                <input
                  ref={selectAll}
                  checked={allSelected}
                  disabled={!visible.length}
                  type="checkbox"
                  aria-label="Select all visible orders"
                  onChange={toggleAll}
                />
              </th>
              <th
                scope="col"
                aria-sort={descending ? "descending" : "ascending"}
              >
                <button onClick={() => setDescending(!descending)}>
                  Order ID <ArrowUpDown size={12} />
                </button>
              </th>
              <th scope="col">Customer</th>
              <th scope="col">Service</th>
              <th scope="col">Date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id}>
                <td>
                  <input
                    checked={selected.includes(order.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(order.id)
                          ? prev.filter((id) => id !== order.id)
                          : [...prev, order.id],
                      )
                    }
                    type="checkbox"
                    aria-label={`Select ${order.id}`}
                  />
                </td>
                <td>
                  <button className="order-id" onClick={() => onSelect(order)}>
                    #{order.id}
                  </button>
                </td>
                <td>
                  <div className="customer-cell">
                    <Avatar person={order} />
                    <div>
                      <strong>{order.name}</strong>
                      <small>{order.email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="service-cell">
                    {order.service}
                    <small>{order.items}</small>
                  </div>
                </td>
                <td className="date-cell">{order.date}</td>
                <td className="amount">{money(order.amount)}</td>
                <td>
                  <Badge status={order.status} />
                </td>
                <td>
                  <button
                    className="row-button"
                    onClick={() => onSelect(order)}
                    aria-label={`View ${order.id}`}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <EmptyState
          title="No matching orders"
          description="Try a different name, email, order ID, or status."
          action="Clear search and filters"
          onAction={reset}
        />
      )}
      <div className="table-footer" aria-live="polite">
        <span>
          {selectedVisible.length
            ? `${selectedVisible.length} selected · `
            : ""}
          Showing{" "}
          <strong>
            {visible.length ? 1 : 0}–{visible.length}
          </strong>{" "}
          of <strong>{orders.length}</strong> orders
        </span>
        <span className="table-footer-note">
          <span className="live-dot" />
          Demo workspace
        </span>
      </div>
    </Panel>
  );
}
