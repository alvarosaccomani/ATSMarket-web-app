# 04. Carrito de Compras y Checkout Multitienda

## 1. Propósito Funcional y Rutas
El flujo transaccional de compras permite gestionar ítems de múltiples comercios en un solo carrito, seleccionando direcciones con geolocalización, cotizando envíos por tienda y completando el pago seguro vía Mercado Pago.

| Vista | Ruta | Componente | Acceso | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Carrito de Compras** | `/user/cart` | `CartComponent` | Libre | Listado agrupado por tienda, cálculo de subtotales y modificación de cantidades. |
| **Pasarela de Compra** | `/user/checkout` | `CheckoutComponent` | `authGuard` | Asistente por pasos: Domicilio, Métodos de Envío, Cupones y Pago. |

---

## 2. Operatoria del Carrito de Compras (`CartComponent`)
- **Agrupamiento por Empresa (`StoreOrderGroup`)**: Los artículos se organizan visualmente por comercio emisor para clarificar origen y logística.
- **Acciones sobre Ítems**:
  - Modificación de Cantidad: Botones `+` y `-` que actualizan el `localStorage` de forma reactiva.
  - Eliminación de Producto: Botón con icono `delete` y confirmación previa (`nz-popconfirm`).
  - Vaciado de Carrito: Acción global de limpieza con confirmación.
- **Resumen Financiero**:
  - Subtotal general de mercadería.
  - Alerta de inicio de sesión requerida para continuar hacia el checkout.
- **Botón `Iniciar Compra`**: Valida disponibilidad de ítems y navega a `/user/checkout`.

---

## 3. Asistente de Checkout por Pasos (`CheckoutComponent`)

El proceso se guía mediante un indicador de pasos interactivo (`nz-steps`):

### Paso 1: Dirección de Entrega
- **Selector de Direcciones Guardadas**: Tarjetas seleccionables con los domicilios registrados del cliente.
- **Alta de Nueva Dirección**:
  - Formulario con campos: Calle, Número, Piso/Depto, Ciudad, Código Postal e Instrucciones.
  - **Selector Geográfico Interactivo (`MapPickerComponent`)**: Mapa integrado con MapLibre para geolocalización precisa con pin arrastrable.

### Paso 2: Opciones de Envío y Cupones por Comercio
- **Logística Segmentada por Tienda**:
  - `moto`: Envío local en moto / cadetería (disponible si la tienda ofrece cobertura en el radio de entrega).
  - `correo`: Envío postal nacional con opciones dinámicas:
    - `correo_std`: Estándar.
    - `correo_exp`: Expreso prioritario.
    - `correo_priority`: Alta prioridad.
  - `retiro`: Retiro sin costo en la sucursal del comercio.
  - `acordar`: Entrega a coordinar directamente con el vendedor.
- **Motor de Cupones de Descuento**:
  - Campo de texto `Código de cupón` y botón `Aplicar`.
  - Validación en tiempo real contra `CouponsService`: comprueba vigencia, monto mínimo y límite de usos.
  - Visualización del descuento aplicado y ajuste del total en vivo.

### Paso 3: Pasarela de Pago
- **Mercado Pago Checkout Brick (`MpPaymentBrickComponent`)**:
  - Formulario embebido seguro para tarjetas de crédito, débito y dinero en cuenta Mercado Pago.
  - Manejo de cuotas, CVV y tokenización segura de tarjetas.
- **Medios Alternativos**: Opciones de pago en efectivo contra entrega (*Cash on delivery*) o transferencia bancaria coordinada.

---

## 4. Finalización y Confirmación de Pedido
1. Se invocan concurrentemente los servicios `OrdersService`, `StockMovementsService` y `InventoryStocksService` para descontar el stock de los almacenes correspondientes.
2. Se emite evento en tiempo real vía `WebSocketNotificationService` para alertar al panel del comerciante.
3. Se presenta la pantalla de confirmación con los números de orden generados y botón de seguimiento en `/application/my-purchases`.
