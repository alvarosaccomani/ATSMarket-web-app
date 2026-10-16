# 01. Introduction and General Architecture

## 1. System Overview
**ATSMarket** is a multi-vendor e-commerce (B2B / B2C) and operational management platform built on **Angular 19**. The application implements an architecture based on standalone components, reactive programming with **RxJS**, and a enterprise design system powered by **Ng-Zorro Ant Design**.

The platform handles end-to-end transactional workflows:
- **Public**: Merchant discovery, global catalog navigation by categories and materials, product and variant exploration.
- **Customer**: Multi-store persistent shopping cart, dynamic shipping rate calculation, coupon redemption, and Mercado Pago integrated checkout.
- **Merchants / Sellers**: Comprehensive backoffice for multi-branch management, physical warehouses, inventory audits with barcode scanners, differentiated price lists, real-time incoming orders via WebSockets, and financial reconciliation.
- **Super Administrator**: Multi-tenant platform management and global configuration parameters.

---

## 2. Main Route Map
Navigation is segmented into modules protected by security *Guards*:

| Module | Route Prefix | Access & Guards | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/auth/*` | `unauthGuard` | Registration, Login, Password recovery, and Account confirmation. |
| **Public** | `/public/*` | Public | Marketplace home, general catalog, merchant stores, and product detail sheets. |
| **Customer / Transactional** | `/user/*` | `authGuard` (Checkout) | Shopping cart and checkout pipeline. |
| **Backoffice / Dashboard** | `/application/*` | `authGuard`, `merchantGuard`, `roleGuard`, `superAdminGuard` | Business management, inventory, incoming orders, finances, and analytical reporting. |

---

## 3. UI Conventions and Visual States
Consistent visual patterns are implemented across all application views:
- **Alerts and Notifications**: Floating toast messages (`nz-message`), confirmation dialogues via `SweetAlert2`, and contextual banners (`nz-alert`).
- **Loading States**: Circular indicators (`nz-spin`) on tables, button-level loading states (`[nzLoading]="true"`) to prevent duplicate submissions, and placeholder skeletons (`nz-skeleton`).
- **Status Badges (`nz-tag`)**:
  - `blue` / `processing`: Pending confirmation or ongoing processes.
  - `green` / `success`: Successful operations, delivered orders, or verified payments.
  - `orange` / `warning`: Low inventory warnings, unpaid orders, or unverified details.
  - `red` / `error`: Canceled orders, transactional failures, or out-of-stock items.
- **Drawers (`nz-drawer`)**: Used for advanced multi-criteria filtering and detailed views without losing table context.
