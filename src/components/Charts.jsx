import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Panel } from "./UI";
import { revenue, statuses, money } from "../data/demo";

export function RevenueChart({ month = "2026-10" }) {
  const [period, setPeriod] = useState("This week");
  const factor = month === "2026-09" ? 0.86 : 1;
  const data = (
    period === "This week"
      ? revenue
      : revenue.map((d) => ({
          ...d,
          current: d.previous,
          previous: Math.round(d.previous * 0.82),
        }))
  ).map((day) => ({
    ...day,
    current: Math.round(day.current * factor),
    previous: Math.round(day.previous * factor),
  }));
  const total = data.reduce((sum, day) => sum + day.current, 0);
  const previous = data.reduce((sum, day) => sum + day.previous, 0);
  const growth = (((total - previous) / previous) * 100).toFixed(1);
  return (
    <Panel
      title="Revenue overview"
      subtitle="A little growth, every single day."
      className="revenue-panel"
      action={
        <label className="select-wrap">
          <select
            aria-label="Revenue period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>This week</option>
            <option>Last week</option>
          </select>
          <ChevronDown size={13} />
        </label>
      }
    >
      <div className="revenue-summary">
        <strong>{money(total)}</strong>
        <span className="growth-pill">
          <ArrowUpRight size={13} />
          {growth}%
        </span>
        <span className="muted">vs previous week</span>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-dot" />
          {period}
        </span>
        <span>
          <i className="legend-dot light" />
          Previous week
        </span>
      </div>
      <div
        className="revenue-chart"
        role="img"
        aria-label={`${period} revenue: ${money(total)}, up ${growth}% from the previous week`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 14, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b76f6" stopOpacity={0.17} />
                <stop offset="100%" stopColor="#3b76f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#edf0f5"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a94a6", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              width={82}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a94a6", fontSize: 10 }}
              ticks={[0, 1000, 2000, 3000]}
              domain={[0, 3000]}
              tickFormatter={money}
            />
            <Tooltip
              formatter={(v) => money(v)}
              contentStyle={{
                border: "1px solid #eef0f5",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="previous"
              name="Previous week"
              stroke="#b8ccef"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey="current"
              name={period}
              stroke="#3475f2"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              activeDot={{ r: 5, stroke: "white", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
export function StatusChart({ data: monthData = statuses }) {
  const [period, setPeriod] = useState("This month");
  const data = monthData.map((s) => ({
    ...s,
    value: period === "This month" ? s.value : Math.round(s.value * 0.24),
  }));
  return (
    <Panel
      title="Order overview"
      subtitle="Every load, accounted for."
      action={
        <label className="select-wrap">
          <select
            aria-label="Order overview period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>This month</option>
            <option>This week</option>
          </select>
          <ChevronDown size={13} />
        </label>
      }
    >
      <div
        className="donut-container"
        role="img"
        aria-label={`Order status overview: ${data.map((status) => `${status.name}: ${status.value}`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={68}
              outerRadius={88}
              paddingAngle={4}
              cornerRadius={4}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-label">
          <strong>
            {data.reduce((n, s) => n + s.value, 0).toLocaleString()}
          </strong>
          <span>Total orders</span>
        </div>
      </div>
      <div className="status-legend">
        {data.map((s) => (
          <div key={s.name}>
            <span>
              <i style={{ background: s.color }} />
              {s.name}
            </span>
            <strong>{s.value}</strong>
            <small>
              {Math.round(
                (s.value / data.reduce((n, x) => n + x.value, 0)) * 100,
              )}
              %
            </small>
          </div>
        ))}
      </div>
    </Panel>
  );
}
