# 06. Inventario, Productos, Variaciones y Almacenes

## 1. Propósito Funcional y Rutas
Este módulo permite la administración integral del ciclo de vida de los productos, la generación matricial de variaciones (talles, colores, materiales), la arquitectura física de almacenes y la auditoría de inventario con escáner de código de barras.

| Vista | Ruta | Componente | Guardias | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Lista de Productos** | `/application/products` | `ProductsComponent` | `merchantGuard` | Catálogo de artículos, precios, filtros y acciones masivas. |
| **Alta / Edición Producto** | `/application/product/:pro_uuid` | `ProductComponent` | `merchantGuard` | Ficha maestra, categorización, precios e imágenes. |
| **Variaciones Globales** | `/application/products-variations` | `ProductsVariationsComponent` | `merchantGuard` | Gestión de combinaciones y stock por variante. |
| **Detalle de Variación** | `/application/product-variation/:pro_uuid/:prov_uuid` | `ProductVariationComponent` | `merchantGuard` | Atributos específicos, SKU individual y sobreprecio. |
| **Almacenes y Pasillos** | `/application/warehouses` | `WarehousesComponent` | `merchantGuard` | Depósitos, sectores, estanterías y ubicaciones físicas. |
| **Auditoría de Inventario** | `/application/inventory-audit` | `InventoryAuditComponent` | `merchantGuard` | Conteos físicos en vivo y ajustes por discrepancia. |
| **Artículos y Materiales** | `/application/items`, `/materials` | `ItemsComponent`, `MaterialsComponent` | `merchantGuard` | Taxonomía de insumos y materias primas. |

---

## 2. Gestión Maestra de Productos (`ProductsComponent`, `ProductComponent`)
- **Ficha Maestra de Producto**:
  - `pro_name` (*Texto*, requerido, min: 3 caracteres): Nombre comercial del producto.
  - `pro_sku` (*Alfanumérico*, requerido): Código de referencia interna único.
  - `pro_barcode` (*Código de barras*, escaneable con cámara): Código EAN/UPC.
  - `pro_price` (*Decimal*, requerido): Precio de venta base.
  - `pro_description` (*Texto enriquecido / Markdown*): Especificaciones técnicas.
  - `cat_uuid` (*Selector jerárquico*): Categoría asignada.
  - **Galería de Imágenes**: Carga múltiple con drag-and-drop y reordenamiento visual.
- **Acciones y Atajos**:
  - Buscador predictivo por SKU o nombre.
  - Conmutador de estado `Activo / Inactivo` sin recarga de página.
  - Eliminación segura mediante diálogo modal de doble confirmación con `SweetAlert2`.

---

## 3. Matriz de Variaciones (`ProductVariationComponent`)
- **Generador de Combinaciones**:
  - Selección de ejes de variación: Talle (`prov_size`), Color (`prov_color`), Material (`prov_material`).
  - Creación automática de la matriz cartesiana de opciones.
- **Parametrización por Variante**:
  - Sobrecosto o descuento relativo sobre el precio base.
  - Código de barras y SKU exclusivo por cada variación.
  - Saldo de stock asignado por almacén (`InventoryStocksService`).

---

## 4. Estructura de Almacenes (`WarehousesComponent`)
- **Depósitos Físicos**: Creación de almacenes centrales, sucursales y depósitos de tránsito.
- **Topología de Almacenamiento**:
  - Jerarquía configurable: Pasillo (*Aisle*) -> Estantería (*Rack*) -> Nivel (*Shelf*) -> Posición (*Bin*).
  - Códigos de barras de ubicación generados dinámicamente para pegado en góndolas.
- **Integración con Escáner de Código de Barras (`BarcodeScannerComponent`)**:
  - Soporta lectores láser tipo pistola (emulación de teclado) y cámara web integrada con detección automática de formatos (EAN-13, CODE-128, QR).

---

## 5. Auditoría de Inventario y Conteos (`InventoryAuditComponent`)
- **Sesiones de Auditoría**: Apertura de rondas de conteo programadas por depósito o sector.
- **Modo Escaneo en Vivo**:
  - El operario escanea sucesivamente códigos de barras; el sistema incrementa el contador en tiempo real con confirmación sonora.
- **Análisis de Discrepancias**:
  - Cuadrícula comparativa: `Stock Teórico` vs `Stock Relevado`.
  - Diferencias coloreadas: `green` (Exacto), `orange` (Sobrante), `red` (Faltante).
- **Ajuste Automatizado**: Botón `Consolidar Ajuste` que impacta directamente en `StockMovementsService` con motivo de auditoría y registra trazabilidad del usuario auditor.
