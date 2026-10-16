# 04. Shopping Cart and Multi-store Checkout

## 1. Functional Scope and Routes
The purchasing pipeline manages items from multiple merchant stores within a unified cart, enabling geolocation-based address selection, store-by-store shipping rate quoting, and secure checkout integration with Mercado Pago.

| View | Route | Component | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Shopping Cart** | `/user/cart` | `CartComponent` | Public | Store-grouped item list, subtotal calculations, and quantity adjustments. |
| **Checkout Wizard** | `/user/checkout` | `CheckoutComponent` | `authGuard` | Step-by-step pipeline: Delivery Address, Shipping Methods, Coupons, and Payment. |

---

## 2. Shopping Cart Operations (`CartComponent`)
- **Store-Based Grouping (`StoreOrderGroup`)**: Line items are visually clustered by selling merchant to ensure full logistical transparency.
- **Item-Level Actions**:
  - Quantity Stepper: `+` and `-` buttons updating reactive cart state in `localStorage`.
  - Item Removal: Action button with `delete` icon and confirmation prompt (`nz-popconfirm`).
  - Clear Cart: Global action with confirmation modal to purge all items.
- **Financial Summary**:
  - Consolidated subtotal of merchandise.
  - Contextual authentication banner indicating login is required to proceed to checkout.
- **`Iniciar Compra` Button**: Validates cart availability and navigates directly to `/user/checkout`.

---

## 3. Step-by-Step Checkout Wizard (`CheckoutComponent`)

The checkout flow is guided through an interactive step indicator (`nz-steps`):

### Step 1: Delivery Address
- **Saved Addresses Selector**: Interactive cards displaying pre-registered user delivery locations.
- **New Address Creation**:
  - Input fields: Street, Number, Floor/Apartment, City, Postal Code, and Delivery Notes.
  - **Interactive Geolocation Picker (`MapPickerComponent`)**: Embedded MapLibre map featuring a draggable marker for precise coordinate capture.

### Step 2: Shipping Options & Store Coupons
- **Store-Level Logistics Breakdown**:
  - `moto`: Local motorcycle delivery (available when the buyer address lies within the store's delivery perimeter).
  - `correo`: National postal service with dynamic tiers:
    - `correo_std`: Standard parcel.
    - `correo_exp`: Express priority.
    - `correo_priority`: Guaranteed urgent dispatch.
  - `retiro`: In-store pickup with zero shipping fee.
  - `acordar`: Custom fulfillment arranged directly between buyer and seller.
- **Coupon Engine**:
  - Input field `Código de cupón` with an `Aplicar` button.
  - Real-time verification via `CouponsService`: validates expiration dates, minimum order value, and usage limits.
  - Instant discount calculation and live order total adjustment.

### Step 3: Payment Gateway
- **Mercado Pago Checkout Brick (`MpPaymentBrickComponent`)**:
  - Secure embedded payment form handling credit cards, debit cards, and Mercado Pago account balances.
  - Native installment calculation, CVV validation, and PCI-compliant card tokenization.
  - Alternative payment methods: Cash on Delivery (COD) or manual bank transfer.

---

## 4. Order Finalization and Post-Purchase Workflow
1. Dispatches parallel transactional requests to `OrdersService`, `StockMovementsService`, and `InventoryStocksService` to reserve inventory across specified warehouses.
2. Broadcasts real-time notifications via `WebSocketNotificationService` alerting the merchant backoffice.
3. Renders the purchase confirmation summary with generated order numbers and a tracking button linking to `/application/my-purchases`.
