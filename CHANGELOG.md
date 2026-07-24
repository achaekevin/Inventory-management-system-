# Changelog

All notable changes to the InvenTrack Inventory Management System are documented here.

---

## [Unreleased]

### Added
- **Workflow Automation Engine** — Administrators can now define configurable automation rules:
  - `low_stock_po` — Auto-creates draft purchase orders when stock falls below reorder threshold
  - `high_value_notify` — Notifies manager roles when a purchase total exceeds a set threshold
  - `overdue_payment_reminder` — Sends in-app reminders for customers with overdue credit balances
  - `archive_inactive_product` — Automatically archives products with no sales activity after N days
- **Automation Scheduler** — Background job (15-minute interval) fires enabled rules based on their configured interval
- **Automation Logs** — Every rule run is recorded with status, items affected, and expandable details
- **Automation UI** — Full admin page at `/automation` with rule cards, enable/disable toggles, Run Now, create/edit dialog, and execution history

---

## [1.4.0] — 2026-07-23

### Added
- **Customer Credit Management** — Credit limits, outstanding balances, credit logs, suspension workflow
- **Credit Page UI** — Customer list with outstanding balances, credit adjustment forms, and history timeline

---

## [1.3.0] — 2026-07-20

### Added
- **Purchase Approval Workflow** — 5-stage pipeline: Draft → Supervisor → Finance → Order → Received
- **Approval Timeline UI** — Visual pipeline banner, step history, and action dialogs with comments
- **Role-based approval gates** — Supervisor, Finance Officer, Procurement Officer role enforcement

---

## [1.2.0] — 2026-07-15

### Added
- **Smart Reorder System** — Detects low-stock products and suggests draft purchase orders
- **Reorder UI** — Urgency-ranked suggestions with one-click PO creation

---

## [1.1.0] — 2026-07-10

### Added
- **Multi-warehouse Inventory** — Track stock across multiple warehouse locations
- **Stock Movements** — Full IN/OUT/ADJUSTMENT/TRANSFER history
- **POS (Point of Sale)** — Fast sales entry with barcode support

---

## [1.0.0] — 2026-07-01

### Added
- Initial release of InvenTrack
- Products, Categories, Brands, Units management
- Suppliers and Customers management
- Purchase and Sales modules
- Payments tracking
- Role-based access control (RBAC) with granular permissions
- Reports and Dashboard analytics
- JWT authentication with refresh tokens and session management
