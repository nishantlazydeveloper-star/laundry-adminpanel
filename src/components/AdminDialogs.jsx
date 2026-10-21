import { useState } from "react";
import { ArrowRight, ArrowUpRight, CircleHelp, Mail, Plus } from "lucide-react";
import { Avatar, Badge, Modal } from "./UI";
import { createOrder, ORDER_STATUSES } from "../lib/admin";
import { money, serviceCatalog } from "../data/demo";
import { serviceIcons } from "../lib/icons";

function NewOrderForm({ selectedService, orders, onCreate, onClose }) {
  const [error, setError] = useState("");
  const [serviceName, setServiceName] = useState(
    selectedService || serviceCatalog[0].name,
  );
  const [quantity, setQuantity] = useState("5");
  const service = serviceCatalog.find((item) => item.name === serviceName);
  const total =
    Number(quantity) > 0
      ? Math.round(service.price * Number(quantity) * 100) / 100
      : 0;
  const submit = (event) => {
    event.preventDefault();
    try {
      onCreate(
        createOrder(
          Object.fromEntries(new FormData(event.currentTarget)),
          orders,
          serviceCatalog,
        ),
      );
    } catch (failure) {
      setError(failure.message);
    }
  };
  return (
    <form onSubmit={submit} className="order-form">
      <p>A fresh start is just a few details away.</p>
      <div className="form-grid">
        <label>
          Customer name
          <input
            name="name"
            placeholder="e.g. Olivia Rhye"
            maxLength={80}
            autoComplete="name"
            required
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            placeholder="customer@email.com"
            maxLength={120}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Service
          <select
            name="service"
            aria-label="Service"
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
          >
            {serviceCatalog.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          Number of items
          <input
            name="items"
            type="number"
            min="1"
            max="100"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </label>
      </div>
      <div className="order-estimate">
        <span>{money(service.price)} per item</span>
        <strong>Order total: {money(total)}</strong>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="button primary">
          <Plus size={16} />
          Create order
        </button>
      </div>
    </form>
  );
}
export function AdminDialogs({
  modal,
  orders,
  customers,
  onClose,
  onModal,
  onCreate,
  onStatusChange,
}) {
  if (!modal) return null;
  const order =
    modal.type === "order" ? orders.find((item) => item.id === modal.id) : null;
  const customer =
    modal.type === "customer"
      ? customers.find((item) => item.email === modal.email)
      : null;
  const service =
    modal.type === "service"
      ? serviceCatalog.find((item) => item.name === modal.name)
      : null;
  const title = {
    new: "Create a new order",
    help: "We’re here to help",
    customer: "Customer details",
    service: service?.name,
    order: `Order #${order?.id}`,
  }[modal.type];
  return (
    <Modal key={modal.type} title={title} onClose={onClose}>
      {modal.type === "new" && (
        <NewOrderForm
          selectedService={modal.service}
          orders={orders}
          onCreate={onCreate}
          onClose={onClose}
        />
      )}
      {modal.type === "help" && (
        <div className="help-content">
          <span className="stat-icon blue">
            <CircleHelp size={26} />
          </span>
          <h3>A real person. A little extra care.</h3>
          <p>
            Our team can help with managing your workspace, understanding
            reports, and keeping your day running smoothly.
          </p>
          <a className="button primary" href="mailto:support@laundro.com">
            <Mail size={16} />
            support@laundro.com
          </a>
          <small>Monday–Friday · 9:00 AM–6:00 PM</small>
        </div>
      )}
      {service && (
        <ServiceDetail
          service={service}
          onCreate={() => onModal({ type: "new", service: service.name })}
        />
      )}
      {customer && (
        <div className="order-detail">
          <div className="detail-person">
            <Avatar person={customer} size="large" />
            <div>
              <h3>{customer.name}</h3>
              <p>{customer.email}</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Total orders</dt>
              <dd>{customer.orders.length}</dd>
            </div>
            <div>
              <dt>Total spent</dt>
              <dd className="detail-amount">{money(customer.totalSpent)}</dd>
            </div>
          </dl>
          <h3 className="customer-orders-heading">Order history</h3>
          <div className="customer-order-history">
            {customer.orders.map((item) => (
              <button
                key={item.id}
                onClick={() => onModal({ type: "order", id: item.id })}
              >
                <span>
                  <strong>#{item.id}</strong>
                  <small>
                    {item.service} · {item.date}
                  </small>
                </span>
                <Badge status={item.status} />
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
      {order && (
        <div className="order-detail">
          <div className="detail-person">
            <Avatar person={order} size="large" />
            <div>
              <h3>{order.name}</h3>
              <p>{order.email}</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Order ID</dt>
              <dd>#{order.id}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>
                {order.service} · {order.items}
              </dd>
            </div>
            <div>
              <dt>Placed on</dt>
              <dd>{order.date}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>
                <Badge status={order.payment} />
              </dd>
            </div>
            <div>
              <dt>Total amount</dt>
              <dd className="detail-amount">{money(order.amount)}</dd>
            </div>
          </dl>
          <label className="status-edit">
            Order status
            <select
              aria-label="Order status"
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <p className="field-hint">
            Status changes are saved immediately for this session.
          </p>
        </div>
      )}
    </Modal>
  );
}
function ServiceDetail({ service, onCreate }) {
  const Icon = serviceIcons[service.icon];
  return (
    <div className="service-detail">
      <span className={`stat-icon ${service.color}`}>
        <Icon size={26} />
      </span>
      <p>{service.desc}</p>
      <h3>
        {money(service.price)} <small>{service.unit}</small>
      </h3>
      <ul>
        <li>Complimentary doorstep pickup and delivery</li>
        <li>Fabric-safe, premium cleaning products</li>
        <li>Carefully inspected before delivery</li>
        <li>Standard turnaround: 24–48 hours</li>
      </ul>
      <button className="button primary" onClick={onCreate}>
        Create an order
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
