# Laundro Admin

A responsive, browser-only laundry business dashboard built with React, Vite, Tailwind CSS, Lucide React, and Recharts.

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Included

- Eight navigable workspace views with hash-based navigation
- Revenue and order status charts with period controls
- Searchable, filterable orders with details, status updates, creation, and CSV export
- Customers, service catalog, scheduled routes, payments, notifications, and editable workspace settings
- Mobile navigation, responsive layouts, keyboard search shortcut, and accessible modal focus management

Reusable UI, charts, and order table components live in `src/components`; static demo data lives in `src/data/demo.js`. Chart code loads separately to keep the initial bundle smaller.

Demo changes are held in React state and reset on refresh. There is no login, API, or backend. Plus Jakarta Sans loads from Google Fonts, with a local sans-serif fallback. All financial amounts use USD, and dates use an October 2026 demo dataset.
