# 08. Business Analytics, Finances and Suppliers

## 1. Functional Scope and Routes
This module provides operational intelligence and financial governance for merchant executives, featuring interactive analytics powered by **ECharts**, digital and cash payment reconciliation, rider settlement auditing, and supplier management.

| View | Route | Component | Guards | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Analytics Dashboard** | `/application/analytics` | `AnalyticsComponent` | `merchantGuard` | Sales KPIs, ECharts graphs, average ticket, and leading products. |
| **Financial Control** | `/application/finances` | `FinancesComponent` | `roleGuard` (Admin / Owner) | Cash balances, bank payout transfers, and delivery rider cash settlements. |
| **Customer CRM** | `/application/customers` | `CustomersComponent` | `merchantGuard` | Customer directory, purchase frequency, and account details. |
| **Suppliers** | `/application/suppliers` | `SuppliersComponent` | `merchantGuard` | Supplier repository, payment terms, and cost records. |
| **Supplier Detail** | `/application/supplier/:sup_uuid` | `SupplierComponent` | `merchantGuard` | Vendor contact card and catalog of provided raw materials. |
| **Price Lists** | `/application/price-list`, `/dist-price-list` | `PriceListComponent`, `DistPriceListComponent` | `merchantGuard` | Retail scales and wholesale distribution tiers. |

---

## 2. Business Intelligence and Analytics Metrics (`AnalyticsComponent`)
- **Dynamic Time Range Filter**: Timeframe selector (Today, Past 7 Days, Current Month, Custom Date Range).
- **Executive KPI Cards (`nz-statistic`)**:
  - Cumulative gross sales revenue.
  - Total volume of completed orders.
  - Average order value (AOV).
  - Order conversion rate.
- **Interactive ECharts Visualizations**:
  - Area Line Chart: Daily revenue progression over time.
  - Bar Chart: Top 5 best-selling products by quantity and revenue.
  - Donut Chart: Revenue distribution by payment gateway (Mercado Pago vs Cash on Delivery).

---

## 3. Financial Balances, Payouts and Rider Settlements (`FinancesComponent`)
- **Balance Segmentation**:
  - Available Digital Funds (Mercado Pago account balance).
  - Cash collected on premises or via delivery couriers.
- **Payout Management (`PayoutEvent`)**:
  - Direct transfer requests to bank accounts (CBU / CVU / Routing Number).
  - Payout lifecycle states: `PENDING`, `COMPLETED`, `REJECTED` with uploaded bank transaction slips.
- **Delivery Rider Settlements (`RiderSettlementViewModel`)**:
  - Courier cash reconciliation desk: Completed deliveries count, theoretical cash collected in hand, and formal settlement sign-off button to close shifts.

---

## 4. CRM, Vendor Relationships and Price Tiers
- **Vendor Management (`SuppliersComponent`)**:
  - Corporate directory, tax ID, payment terms (Net 30, Net 60, COD), and supplied inventory components.
- **Distributor Price Lists (`DistPriceListComponent`)**:
  - Configurable pricing rules providing percentage markups or volume discounts for wholesale distributors.
