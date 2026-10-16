# 07. Gestión de Pedidos, Compras y Cupones

## 1. Propósito Funcional y Rutas
Este módulo nuclea el procesamiento operativo de las ventas recibidas por los comercios, el seguimiento de compras del lado del cliente, el motor de fidelización con cupones promocionales y los artículos favoritos.

| Vista | Ruta | Componente | Guardias | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Pedidos Recibidos** | `/application/orders-received` | `OrdersReceivedComponent` | `merchantGuard` | Mesa de despacho, control de estados, chat y emisión de remitos. |
| **Mis Compras** | `/application/my-purchases` | `MyPurchasesComponent` | `authGuard` | Historial de órdenes de compra del usuario con línea de tiempo. |
| **Cupones de Descuento** | `/application/coupons` | `CouponsComponent` | `merchantGuard` | Generador y administración de códigos de descuento. |
| **Mis Favoritos** | `/application/my-favorites` | `MyFavoritesComponent` | `authGuard` | Lista de deseos y guardados para compra recurrente. |

---

## 2. Mesa Operativa de Pedidos Recibidos (`OrdersReceivedComponent`)
- **Pestañas de Estado Logístico (`nz-tabs`)**:
  - `Todos`: Panorama global de transacciones.
  - `Pendientes`: Pedidos ingresados pendientes de confirmación comercial.
  - `Confirmados`: Pagos acreditados o compras contra entrega aceptadas.
  - `En Preparación`: Órdenes en proceso de *picking* y empaque.
  - `Despachados`: En tránsito con cadete o número de guía postal.
  - `Entregados`: Órdenes finalizadas y cerradas con éxito.
  - `Cancelados`: Operaciones anuladas con reintegro automático de stock.
- **Drawer de Detalle del Pedido (`nz-drawer`)**:
  - Ficha de datos del cliente: Nombre, teléfono y correo electrónico.
  - Domicilio de entrega con visualización de coordenadas o instrucciones de acceso.
  - Desglose de ítems, precios unitarios, variaciones, subtotal y descuento de cupón aplicado.
- **Canal de Chat en Tiempo Real (`ChatService`)**:
  - Drawer lateral para comunicación directa y bidireccional entre el vendedor y el comprador sin salir de la plataforma, sincronizado por WebSockets.
- **Emisión de Remitos y Comprobantes**:
  - Botón `Imprimir Remito`: Generación en el navegador de documentos PDF de despacho con `jspdf` y `jspdf-autotable`.
- **Verificación con Escáner (`BarcodeScannerComponent`)**:
  - Permite pistolear los productos antes de cerrar la caja para evitar despachos erróneos.

---

## 3. Seguimiento de Compras (`MyPurchasesComponent`)
- **Línea de Tiempo de Estados**: Indicador visual paso a paso con la evolución del pedido (Creado -> En Preparación -> En Camino -> Entregado).
- **Acciones Disponibles**:
  - Descarga de comprobantes de compra.
  - Enlace al chat con el vendedor para consultas sobre la entrega.
  - Botón `Volver a Comprar` para clonar los ítems directamente al carrito actual.

---

## 4. Motor de Cupones Promocionales (`CouponsComponent`)
- **Formulario de Alta de Cupón**:
  - `coup_code` (*Texto*, requerido): Código alfanumérico en mayúsculas (ej: `VERANO2026`).
  - `coup_type` (*Selector*): Tipo de beneficio: `percentage` (porcentaje sobre el subtotal) o `fixed` (monto nominal fijo).
  - `coup_value` (*Numérico*, requerido): Valor del descuento.
  - `coup_min_amount` (*Numérico*): Monto mínimo de pedido requerido para su activación.
  - `coup_expiration` (*Fecha / Hora*): Límite temporal de vigencia.
  - `coup_max_uses` (*Numérico*): Cupo máximo de canjes permitidos en la plataforma.
- **Control de Estado**: Conmutador inmediato `Activo / Inactivo` y métrica en tiempo real de canjes consumidos.
