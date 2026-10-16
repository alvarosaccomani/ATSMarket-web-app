# 01. Introducción y Arquitectura General

## 1. Visión General del Sistema
**ATSMarket** es una plataforma de comercio electrónico multitienda (B2B / B2C) y gestión operativa construida sobre **Angular 19**. La aplicación implementa arquitectura basada en componentes independientes (*standalone components*), programación reactiva con **RxJS** y un sistema de diseño visual corporativo provisto por **Ng-Zorro Ant Design**.

El sistema articula flujos transaccionales completos:
- **Público**: Descubrimiento de comercios, navegación de catálogo global por categorías y materiales, visualización de productos y variantes.
- **Cliente**: Gestión de carrito persistente multitienda, cotización de envíos dinámicos, aplicación de cupones y checkout integrado con Mercado Pago.
- **Empresas / Vendedores (Merchants)**: Panel de control integral para administración de sucursales, almacenes físicos, control de stock y auditoría de inventario por código de barras, listas de precios diferenciadas, recepción de pedidos con actualización en tiempo real vía WebSockets y conciliación financiera.
- **Super Administrador**: Gestión multitenant de empresas y parametrizaciones maestras de la plataforma.

---

## 2. Mapa de Rutas Principales
La navegación está organizada en módulos delimitados por *Guards* de seguridad:

| Módulo | Prefijo de Ruta | Acceso y Guardias | Descripción |
| :--- | :--- | :--- | :--- |
| **Autenticación** | `/auth/*` | `unauthGuard` | Registro, Login, Recuperación y confirmación de cuentas. |
| **Público** | `/public/*` | Público | Portada del mercado, catálogo general, tiendas individuales y fichas técnicas de productos. |
| **Cliente / Transaccional** | `/user/*` | `authGuard` (Checkout) | Carrito de compras y pasarela de checkout. |
| **Panel de Administración** | `/application/*` | `authGuard`, `merchantGuard`, `roleGuard`, `superAdminGuard` | Gestión comercial, inventario, pedidos recibidos, finanzas y reportes analíticos. |

---

## 3. Convenciones Visuales y Estados de Interfaz
A lo largo de todos los módulos del sistema se utilizan patrones visuales unificados:
- **Alertas y Notificaciones**: Mensajes flotantes de retroalimentación (`nz-message`), diálogos modales de confirmación irreversible con `SweetAlert2` y banners contextuales (`nz-alert`).
- **Estados de Carga**: Indicadores circulares `nz-spin` sobre tablas, botones con estado `[nzLoading]="true"` para evitar doble submit transaccional, y esqueletos (`nz-skeleton`) durante la carga inicial de datos.
- **Etiquetas de Estado (`nz-tag`)**:
  - `blue` / `processing`: Estados pendientes de confirmación o en proceso.
  - `green` / `success`: Operaciones exitosas, pedidos entregados o pagos acreditados.
  - `orange` / `warning`: Alertas de bajo stock, pedidos pendientes de pago o datos por verificar.
  - `red` / `error`: Pedidos cancelados, errores transaccionales o stock agotado.
- **Diálogos Laterales (`nz-drawer`)**: Empleados preferentemente para filtros avanzados y visualización de detalles sin perder el contexto de la lista principal.
