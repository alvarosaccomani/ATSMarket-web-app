# 07. Orders Management, Purchases and Coupons

## 1. Functional Scope and Routes
This module coordinates the merchant fulfillment pipeline for incoming orders, customer-facing purchase tracking, the promotional discount coupon engine, and customer wishlists.

| View | Route | Component | Guards | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Incoming Orders** | `/application/orders-received` | `OrdersReceivedComponent` | `merchantGuard` | Dispatch board, status pipeline, live chat, and packing slips. |
| **My Purchases** | `/application/my-purchases` | `MyPurchasesComponent` | `authGuard` | Buyer order history with interactive milestone tracking. |
| **Discount Coupons** | `/application/coupons` | `CouponsComponent` | `merchantGuard` | Promotional discount code generator and rule management. |
| **My Favorites** | `/application/my-favorites` | `MyFavoritesComponent` | `authGuard` | Customer wishlist and fast re-ordering bookmarks. |

---

## 2. Orders Fulfillment Desk (`OrdersReceivedComponent`)
- **Fulfillment Status Pipeline Tabs (`nz-tabs`)**:
  - `Todos`: Consolidated overview of all historical and active orders.
  - `Pendientes`: Inbound orders awaiting merchant acceptance.
  - `Confirmados`: Payment verified or approved Cash on Delivery orders.
  - `En Preparación`: Orders currently being picked and packaged.
  - `Despachados`: Outbound orders in transit via motorcycle courier or postal service.
  - `Entregados`: Successfully delivered and closed transactions.
  - `Cancelados`: Voided transactions triggering automatic inventory restoration.
- **Order Details Drawer (`nz-drawer`)**:
  - Customer contact sheet: Full name, telephone number, and email.
  - Delivery destination with geographical coordinates and delivery instructions.
  - Breakdown of line items, unit prices, variant specifics, subtotal, and applied coupon discounts.
- **Real-Time Customer Messaging (`ChatService`)**:
  - Embedded slide-out drawer providing direct, two-way messaging between merchant and customer via WebSockets.
- **Packing Slip & Invoice Generation**:
  - `Imprimir Remito` Action: In-browser PDF generation utilizing `jspdf` and `jspdf-autotable`.
- **Barcode Verification Scan (`BarcodeScannerComponent`)**:
  - Enables physical scanning of merchandise prior to dispatch to prevent mispicks.

---

## 3. Buyer Purchase Tracking (`MyPurchasesComponent`)
- **Interactive Milestone Timeline**: Step-by-step visual tracker (Order Placed -> Preparing -> Dispatched -> Delivered).
- **Available Actions**:
  - Purchase receipt and invoice download.
  - Direct shortcut to customer-merchant order chat.
  - `Volver a Comprar` button instantly cloning order contents into the active shopping cart.

---

## 4. Promotional Coupon Engine (`CouponsComponent`)
- **Coupon Creation Parameters**:
  - `coup_code` (*Text*, required): Uppercase alphanumeric identifier (e.g., `SUMMER2026`).
  - `coup_type` (*Dropdown*): Discount mechanic: `percentage` (% off order subtotal) or `fixed` (flat nominal discount).
  - `coup_value` (*Numeric*, required): Discount rate or monetary amount.
  - `coup_min_amount` (*Numeric*): Minimum cart value required to activate the promotion.
  - `coup_expiration` (*Date / Time*): Validity deadline.
  - `coup_max_uses` (*Numeric*): Total redemption limit across the marketplace.
- **Lifecycle Management**: Instant `Active / Inactive` status switch and real-time counter of redeemed instances.
