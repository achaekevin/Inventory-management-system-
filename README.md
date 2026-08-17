# Inventory Management System

A full-stack inventory management platform for stock control, sales, purchasing, and financial visibility. It combines a React frontend dashboard with a secure REST API and a MySQL database, covering batch lot tracking, multi-warehouse stock movements, automated reordering, purchase approval workflows, customer credit management, and offline-capable point of sale operations.

---

## Technology Stack

### Frontend

| Layer | Technology |
|-------|------------|
| UI Library | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| Server State | TanStack Query |
| Client State | Zustand |
| Forms & Validation | React Hook Form, Zod |
| UI Components | Radix UI, Sonner, Vaul |
| Charts | Recharts |
| Animations | Framer Motion |
| Data Tables | TanStack Table |
| HTTP Client | Axios |
| Icons | Lucide React |
| Report Export | jsPDF, SheetJS (xlsx) |
| Offline / PWA | Service Worker, IndexedDB |
| Date Handling | date-fns |

### Backend

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | MySQL with Prisma ORM |
| Validation | Zod, express-validator |
| Authentication | JWT, bcryptjs |
| Authorization | Role-Based Access Control (RBAC) |
| Security | Helmet, CORS, rate limiting |
| Scheduling | node-cron, Bull |
| Logging | Winston, Morgan |
| File Uploads | Multer |
| Email | Nodemailer |
| Testing | Vitest, Supertest |

---

## Features

- Product catalog with SKU, barcode, QR code, images, variants, pricing, and cost tracking.
- Hierarchical categories, brands, and measurement units with price history.
- Multi-warehouse management with zones and per-warehouse stock levels.
- Stock movement ledger for purchases, sales, adjustments, transfers, damage, and returns.
- Inter-warehouse transfers with approval tracking.
- Low-stock, out-of-stock, and overstock detection.
- Inventory heat map classifying products as fast-moving, slow-moving, low-stock, or overstocked.
- Batch and lot tracking with manufacturing and expiry dates.
- Batch lifecycle statuses and recall management workflow.
- Point of sale interface with fast product lookup and invoicing.
- Sales with line items, taxes, discounts, partial payments, and returns.
- Payment methods including cash, card, bank transfer, mobile money, and credit.
- Purchase order lifecycle from draft to received with automatic stock updates.
- Multi-step approval workflow with supervisor and finance approvals.
- Smart reorder engine that detects low stock, ranks urgency, suggests suppliers, and creates draft purchase orders.
- Workflow automation rules for low-stock purchase orders, high-value purchase alerts, overdue payment reminders, and archiving inactive products.
- Scheduled and manual automation runs with execution logs.
- Individual and business customer profiles.
- Customer credit management with limits, suspension, utilization, and overdue detection.
- Supplier directory with contacts, payment terms, and credit limits.
- JWT authentication with refresh tokens and session management.
- Role-based access control with granular permissions.
- Security center with two-factor authentication, device management, password policies, and API tokens.
- Dashboard with sales, purchase, inventory, and customer statistics.
- Reports with PDF, Excel, and CSV export.
- Audit logging and activity timeline for security and operations.
- Localization with multiple languages, currencies, timezones, date formats, and tax rules.
- External API endpoints for mobile apps, barcode scanners, and third-party ERP systems.
- Offline-first PWA with service worker caching and automatic transaction sync.
- Global search, notifications, document management, and system settings.

---

## Project Structure

```
inventory-management-system/
│
├── backend/                          REST API (Express, Prisma, MySQL)
│   ├── prisma/
│   │   ├── schema.prisma             Database schema and relations
│   │   ├── migrations/               Versioned database migrations
│   │   ├── seed.ts                   Database seed script
│   │   └── seeds/                    Seed data (roles, permissions)
│   ├── src/
│   │   ├── server.ts                 Application entry point
│   │   ├── app.ts                    Express setup and route mounting
│   │   ├── config/                   Environment, database, logger
│   │   ├── common/
│   │   │   ├── errors/               Custom error classes
│   │   │   ├── middleware/           Auth, validation, error handling
│   │   │   └── utilities/            Pagination and response helpers
│   │   └── modules/                  Feature modules (controller, routes, service)
│   │       ├── activity/             Activity timeline
│   │       ├── auth/                 Authentication
│   │       ├── automation/           Automation rules and scheduler
│   │       ├── batches/              Batch and lot tracking
│   │       ├── brands/               Product brands
│   │       ├── categories/           Product categories
│   │       ├── credit/               Customer credit management
│   │       ├── customers/            Customer directory
│   │       ├── dashboard/            Dashboard statistics
│   │       ├── documents/            File attachments
│   │       ├── external-api/         Mobile and third-party APIs
│   │       ├── inventory/            Stock management
│   │       ├── inventory-heatmap/    Inventory heat map
│   │       ├── localization/         Languages, currencies, tax
│   │       ├── payments/             Payments
│   │       ├── products/             Product catalog
│   │       ├── purchases/            Purchase orders
│   │       ├── reorder/              Smart reorder engine
│   │       ├── reports/              Reporting
│   │       ├── roles/                Roles and permissions
│   │       ├── sales/                Sales and POS
│   │       ├── search/               Global search
│   │       ├── security/             2FA, sessions, API tokens
│   │       ├── suppliers/            Supplier directory
│   │       ├── units/                Measurement units
│   │       ├── users/                User management
│   │       ├── warehouses/           Warehouses and zones
│   │       └── workflow/             Purchase approval workflow
│   ├── create-admin.js               Admin creation script
│   ├── seed-all-users.js             User seeding script
│   ├── .env.example                  Environment template
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                         React dashboard (Vite, Tailwind)
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── .env.example                  Environment template
    ├── public/
    │   ├── favicon.svg
    │   ├── icons.svg
    │   ├── manifest.json             PWA manifest
    │   └── sw.js                     Service worker
    └── src/
        ├── main.tsx                  React entry point
        ├── App.tsx                   Root component with providers
        ├── index.css                 Global styles
        ├── assets/                   Static images and icons
        ├── components/
        │   ├── landing/              Landing page sections
        │   ├── layout/               App shell and sidebar
        │   ├── shared/               Shared components
        │   └── ui/                   UI primitives
        ├── contexts/                 Theme, localization, offline state
        ├── features/                 Feature-scoped modules
        │   ├── activity/
        │   ├── auth/
        │   ├── automation/
        │   ├── batches/
        │   ├── brands/
        │   ├── categories/
        │   ├── credit/
        │   ├── customers/
        │   ├── dashboard/
        │   ├── documents/
        │   ├── external-api/
        │   ├── inventory/
        │   ├── inventory-heatmap/
        │   ├── localization/
        │   ├── payments/
        │   ├── products/
        │   ├── profile/
        │   ├── purchases/
        │   ├── reorder/
        │   ├── reports/
        │   ├── roles/
        │   ├── sales/
        │   ├── search/
        │   ├── security/
        │   ├── settings/
        │   ├── suppliers/
        │   ├── units/
        │   ├── users/
        │   ├── warehouses/
        │   └── workflow/
        ├── hooks/                    Custom React hooks
        ├── layouts/
        │   ├── auth-layout.tsx       Auth pages layout
        │   └── main-layout.tsx       App layout
        ├── lib/
        │   ├── api-client.ts         Axios setup and interceptors
        │   ├── query-client.ts       Query configuration
        │   ├── offline-db.ts         IndexedDB offline storage
        │   ├── sync-engine.ts        Offline sync engine
        │   ├── report-exporter.ts    PDF, Excel, CSV export
        │   ├── sw-register.ts        Service worker registration
        │   ├── constants.ts          App constants
        │   └── utils.ts              Utility functions
        ├── pages/
        │   ├── LandingPage.tsx       Public landing page
        │   └── search-page.tsx       Search results page
        ├── routes/
        │   └── index.tsx             Route definitions and guards
        ├── store/
        │   ├── auth-store.ts         Auth state
        │   └── ui-store.ts           UI state
        ├── types/
        │   └── index.ts              Shared TypeScript types
        └── utils/
            ├── format.ts             Formatting helpers
            ├── permissions.ts        Permission helpers
            ├── storage.ts            Storage helpers
            └── validation.ts         Validation helpers
