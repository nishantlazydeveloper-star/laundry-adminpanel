import {
  X,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  SearchX,
} from "lucide-react";
import { useEffect, useRef } from "react";

export function Avatar({ person, size = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`avatar ${person.color || "blue"} ${size}`}
    >
      {person.initials || "AJ"}
    </span>
  );
}
export function Badge({ status }) {
  return (
    <span className={`badge ${status.toLowerCase().replaceAll(" ", "-")}`}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}
export function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  points,
  comparison = "vs last month",
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${color}`}>
          <Icon size={19} />
        </span>
        <span className="stat-label">{label}</span>
        <ArrowUpRight size={16} className="muted" aria-hidden="true" />
      </div>
      <div className="stat-bottom">
        <div>
          <h2>{value}</h2>
          <span className="growth">
            <ArrowUpRight size={13} />
            {change}
          </span>
          <span className="comparison"> {comparison}</span>
        </div>
        <svg
          viewBox="0 0 100 42"
          className={`sparkline ${color}`}
          aria-hidden="true"
        >
          <path
            d={`M ${points} L 100 42 L 0 42 Z`}
            fill="currentColor"
            opacity=".07"
          />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
export function FocusScope({
  children,
  className,
  label,
  onClose,
  dialog = true,
}) {
  const container = useRef(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    if (dialog) document.body.style.overflow = "hidden";
    const getElements = () =>
      [
        ...container.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length);
    (getElements()[0] || container.current).focus();
    const handler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current?.();
      }
      if (event.key !== "Tab" || !dialog) return;
      const elements = getElements();
      const first = elements[0],
        last = elements.at(-1);
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === container.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const outside = (event) => {
      if (!dialog && !container.current.parentElement.contains(event.target))
        close.current?.();
    };
    document.addEventListener("keydown", handler);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handler);
      document.removeEventListener("pointerdown", outside);
      if (document.contains(previous)) previous.focus();
    };
  }, [dialog]);
  return (
    <div
      ref={container}
      className={className}
      role="dialog"
      aria-modal={dialog ? "true" : undefined}
      aria-label={label}
      tabIndex={-1}
      onBlur={(event) => {
        if (
          !dialog &&
          event.relatedTarget &&
          !event.currentTarget.parentElement.contains(event.relatedTarget)
        )
          close.current?.();
      }}
    >
      {children}
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <FocusScope className="modal" label={title} onClose={onClose}>
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </FocusScope>
    </div>
  );
}
export function Toast({ message }) {
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={19} />
      {message}
    </div>
  );
}
export function TextLink({ children, onClick }) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ChevronRight size={15} />
    </button>
  );
}
export function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon">
        <SearchX size={24} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button secondary small" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
