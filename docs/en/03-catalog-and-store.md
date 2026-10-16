# 03. Public Catalog and Store Exploration

## 1. Functional Scope and Routes
The public module provides the digital storefront experience where customers and visitors discover merchants, filter catalogs by trade sector or material, and inspect detailed product specifications and variations.

| View | Route | Component | Description |
| :--- | :--- | :--- | :--- |
| **Marketplace Home** | `/public/market-home` | `MarketHomeComponent` | Promotional banner carousel, category grid, and featured stores. |
| **Category Explorer** | `/public/categories-list` | `CategoriesListComponent` | Full tree of global taxonomies and category classifications. |
| **Store Profile** | `/public/home-store/:slug` | `HomeStoreComponent` | Merchant public profile, general information, and branches. |
| **Store Catalog** | `/public/store-catalog/:slug` | `StoreCatalogComponent` | Merchant-specific product catalog with category filters. |
| **Global Catalog** | `/public/catalog` | `CatalogComponent` | Cross-merchant global search with advanced filtering drawer. |
| **Product Detail** | `/public/store-catalog/:slug/product/:pro_uuid` | `ProductDetailComponent` | Media gallery, variant selectors, live stock status, and reviews. |

---

## 2. UI Components and User Actions

### Marketplace Home & Global Catalog (`MarketHomeComponent`, `CatalogComponent`)
- **Reactive Search Field (`searchTerm`)**: Text input with debounce timing to issue optimized queries without full-page reloads.
- **Advanced Filter Drawer (`nz-drawer`)**:
  - Trigger: `Filtrar Catálogo` button with `filter` icon.
  - **Global Categories**: Dropdown selector (`nz-select`) with autocomplete to narrow search by category sector.
  - **Materials**: Multi-checkbox group (`nz-checkbox`) for physical composition filtering (wood, metal, fabric, etc.).
  - **Price Range**: Min/max input fields.
  - Action button: `Cerrar / Aplicar`.
- **Preload Directive (`ImagePreloadDirective`)**: Automatically renders a neutral placeholder in case of slow networks or broken image URLs.

### Product Detail View (`ProductDetailComponent`)
- **Image Gallery**: Carousel display with high-resolution main image and selectable thumbnail gallery.
- **Variant Selector**: Interactive chips for dynamic attributes (sizes, colors, materials) synchronized with `ProductVariationsService`. Selecting a combination:
  - Updates the active SKU.
  - Recalculates current pricing and warehouse stock availability in real time.
  - Visual status badge: `green` (In Stock), `orange` (Low Stock), `red` (Out of Stock).
- **Quantity Stepper**: Incremental buttons (`+` / `-`) constrained to maximum available inventory.
- **`Agregar al Carrito` Button**: Primary button dispatching reactive cart update signals to `CartService`.
- **Customer Reviews**: Star rating summary (`nz-rate`) and list of verified customer reviews and comments.
