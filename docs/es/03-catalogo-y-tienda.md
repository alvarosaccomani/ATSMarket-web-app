# 03. Catálogo Público y Exploración de Tiendas

## 1. Propósito Funcional y Rutas
El módulo público ofrece la experiencia de vitrina digital donde clientes y visitantes pueden descubrir tiendas, filtrar catálogos por rubro o material, y examinar especificaciones de productos y variantes.

| Vista | Ruta | Componente | Descripción |
| :--- | :--- | :--- | :--- |
| **Mercado Principal** | `/public/market-home` | `MarketHomeComponent` | Carrusel promocional, cuadrícula de categorías y tiendas destacadas. |
| **Explorador de Categorías** | `/public/categories-list` | `CategoriesListComponent` | Árbol completo de taxonomía de categorías globales. |
| **Perfil de Tienda** | `/public/home-store/:slug` | `HomeStoreComponent` | Portada institucional del comercio, información y sucursales. |
| **Catálogo de Tienda** | `/public/store-catalog/:slug` | `StoreCatalogComponent` | Listado de productos propio de la empresa con filtros por categoría. |
| **Catálogo Global** | `/public/catalog` | `CatalogComponent` | Buscador transversal multitienda con panel lateral de filtros avanzados. |
| **Detalle de Producto** | `/public/store-catalog/:slug/product/:pro_uuid` | `ProductDetailComponent` | Galería multimedia, selector de variaciones, stock y reseñas. |

---

## 2. Componentes de Interfaz y Acciones de Usuario

### Portada y Catálogo Global (`MarketHomeComponent`, `CatalogComponent`)
- **Buscador Reactivo (`searchTerm`)**: Campo de texto con retardo (*debounce*) que dispara consultas optimizadas sin recargar la página.
- **Drawer de Filtros Avanzados (`nz-drawer`)**:
  - Activador: Botón `Filtrar Catálogo` con icono `filter`.
  - **Categorías Globales**: Selector desplegable `nz-select` con autocompletado para acotar por rubro.
  - **Materiales**: Lista de casillas de verificación (`nz-checkbox`) para filtrar composiciones (madera, metal, tela, etc.).
  - **Rango de Precios**: Controles de valor mínimo y máximo.
  - Botón de cierre o aplicación `Cerrar / Aplicar`.
- **Directiva de Precarga (`ImagePreloadDirective`)**: Garantiza la sustitución automática por un *placeholder* neutro en caso de retardo de red o imágenes rotas.

### Ficha Técnica de Producto (`ProductDetailComponent`)
- **Galería Fotográfica**: Carrusel con visualización en alta resolución y miniaturas seleccionables.
- **Selector de Variaciones**: Conmutadores de atributos dinámicos (talles, colores, materiales) sincronizados con `ProductVariationsService`. Al seleccionar una combinación:
  - Se actualiza el SKU.
  - Se recalculan el precio vigente y la disponibilidad de stock en tiempo real.
  - Badge visual de disponibilidad: `green` (Disponible), `orange` (Últimas unidades), `red` (Sin stock).
- **Control de Cantidad**: Selector incremental con botones `+` y `-` delimitado por el stock disponible.
- **Botón `Agregar al Carrito`**: Tipo primario con feedback sonoro/visual y emisión de evento reactivo hacia `CartService`.
- **Módulo de Reseñas y Calificaciones**: Promedio general en estrellas (`nz-rate`) y listado de opiniones verificadas de compradores.
