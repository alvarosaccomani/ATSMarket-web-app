# 06. Inventory, Products, Variations and Warehouses

## 1. Functional Scope and Routes
This module manages the product lifecycle, matrix generation of product variations (sizes, colors, materials), physical warehouse topology, and barcode-driven inventory auditing.

| View | Route | Component | Guards | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Product List** | `/application/products` | `ProductsComponent` | `merchantGuard` | Catalog directory, pricing, filters, and batch operations. |
| **Create / Edit Product** | `/application/product/:pro_uuid` | `ProductComponent` | `merchantGuard` | Master product form, categorization, pricing, and images. |
| **Global Variations** | `/application/products-variations` | `ProductsVariationsComponent` | `merchantGuard` | Attribute combinations and variation stock levels. |
| **Variation Detail** | `/application/product-variation/:pro_uuid/:prov_uuid` | `ProductVariationComponent` | `merchantGuard` | Custom attributes, unique SKU, and price adjustments. |
| **Warehouses & Aisles** | `/application/warehouses` | `WarehousesComponent` | `merchantGuard` | Physical storage sites, racks, shelves, and bin locations. |
| **Inventory Audit** | `/application/inventory-audit` | `InventoryAuditComponent` | `merchantGuard` | Live stock counting and discrepancy adjustments. |
| **Items & Materials** | `/application/items`, `/materials` | `ItemsComponent`, `MaterialsComponent` | `merchantGuard` | Internal taxonomy of inputs and raw materials. |

---

## 2. Product Master Catalog (`ProductsComponent`, `ProductComponent`)
- **Master Product Record**:
  - `pro_name` (*Text*, required, min: 3 characters): Commercial product name.
  - `pro_sku` (*Alphanumeric*, required): Unique internal reference code.
  - `pro_barcode` (*Barcode*, camera-scannable): Standard EAN/UPC identifier.
  - `pro_price` (*Decimal*, required): Base retail selling price.
  - `pro_description` (*Rich Text / Markdown*): Technical product specifications.
  - `cat_uuid` (*Hierarchical selector*): Assigned category.
  - **Image Gallery**: Multi-file drag-and-drop uploader with visual reordering.
- **Actions and Shortcuts**:
  - Predictive search bar querying SKU or name.
  - Instant `Active / Inactive` toggle switch without page reload.
  - Safe deletion modal with two-step `SweetAlert2` confirmation.

---

## 3. Product Variations Matrix (`ProductVariationComponent`)
- **Matrix Combination Generator**:
  - Attribute selection axes: Size (`prov_size`), Color (`prov_color`), Material (`prov_material`).
  - Automatic Cartesian product generation of all variant combinations.
- **Variant-Level Overrides**:
  - Relative price markup or discount against base price.
  - Dedicated SKU and barcode per variation.
  - Independent stock balancing per warehouse via `InventoryStocksService`.

---

## 4. Warehouse Architecture (`WarehousesComponent`)
- **Physical Warehouses**: Setup of central distribution hubs, regional branches, and transit depots.
- **Storage Topology Hierarchy**:
  - Configurable structure: Aisle -> Rack -> Shelf -> Bin.
  - Dynamic generation of barcode labels for bin rack tagging.
- **Barcode Scanner Integration (`BarcodeScannerComponent`)**:
  - Compatible with USB/Bluetooth laser barcode scanners (keyboard emulation mode) and webcam barcode recognition (EAN-13, CODE-128, QR).

---

## 5. Inventory Auditing & Reconciliation (`InventoryAuditComponent`)
- **Audit Sessions**: Creation of structured counting sessions by depot or aisle sector.
- **Live Scanning Mode**:
  - Operators scan items continuously; the system increments counts in real time with acoustic and visual feedback.
- **Discrepancy Analysis**:
  - Comparative matrix: `Book Inventory` vs `Physical Count`.
  - Color-coded variance tags: `green` (Exact Match), `orange` (Surplus), `red` (Shortage).
- **Automated Balancing**: The `Consolidar Ajuste` action records offsetting journal entries in `StockMovementsService` while maintaining full audit trail of the conducting operator.
