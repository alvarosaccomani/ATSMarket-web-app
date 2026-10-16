# 08. Analíticas de Negocio, Finanzas y Proveedores

## 1. Propósito Funcional y Rutas
Este módulo proporciona inteligencia comercial y control financiero para los administradores de empresa, abarcando gráficos de rendimiento con **ECharts**, conciliación de cobranzas digitales y en efectivo, liquidaciones de cadetes y gestión de proveedores.

| Vista | Ruta | Componente | Guardias | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Panel Analítico** | `/application/analytics` | `AnalyticsComponent` | `merchantGuard` | Métricas de ventas, gráficos ECharts, ticket promedio y productos líderes. |
| **Control Financiero** | `/application/finances` | `FinancesComponent` | `roleGuard` (Admin / Owner) | Balances de caja, retiros a cuentas bancarias y liquidación a cadetes. |
| **Cartera de Clientes** | `/application/customers` | `CustomersComponent` | `merchantGuard` | Directorio CRM de compradores, frecuencia de compra y contacto. |
| **Proveedores** | `/application/suppliers` | `SuppliersComponent` | `merchantGuard` | Registro de proveedores, condiciones de pago y listas de costo. |
| **Ficha de Proveedor** | `/application/supplier/:sup_uuid` | `SupplierComponent` | `merchantGuard` | Datos de contacto y materias primas provistas. |
| **Listas de Precios** | `/application/price-list`, `/dist-price-list` | `PriceListComponent`, `DistPriceListComponent` | `merchantGuard` | Escalas de precios minoristas y distribuidor mayorista. |

---

## 2. Métricas y Gráficos de Rendimiento (`AnalyticsComponent`)
- **Filtro Temporal Dinámico**: Selector de periodo (Hoy, Últimos 7 Días, Mes Actual, Rango Personalizado).
- **Tarjetas de Estadísticas Clave (`nz-statistic`)**:
  - Facturación total bruta acumulada.
  - Volumen total de órdenes procesadas.
  - Ticket promedio por compra.
  - Tasa de conversión de pedidos finalizados.
- **Visualizaciones Interactivas con ECharts**:
  - Gráfico de Líneas / Áreas: Evolución temporal de ingresos diarios.
  - Gráfico de Barras: Top 5 de productos más vendidos por volumen y facturación.
  - Gráfico Circular (*Donut*): Proporción de cobros por método de pago (Mercado Pago vs Efectivo contra entrega).

---

## 3. Finanzas, Retiros y Liquidación de Cadetes (`FinancesComponent`)
- **Desglose de Saldos**:
  - Saldo Disponible en Plataforma Digital (Mercado Pago).
  - Efectivo Cobrado en Mostrador / Entrega a Domicilio.
- **Gestión de Retiros (`PayoutEvent`)**:
  - Solicitud de transferencia a cuenta bancaria (CBU / CVU / Alias).
  - Estados del retiro: `PENDING`, `COMPLETED`, `REJECTED` con adjunto de comprobante bancario.
- **Rendición de Cadetes y Repartidores (`RiderSettlementViewModel`)**:
  - Panel de conciliación de efectivo por cadete: Cantidad de entregas realizadas, total teórico de dinero en efectivo recaudado y botón de confirmación de rendición para cierre de turno.

---

## 4. CRM de Clientes, Proveedores y Precios Diferenciados
- **Gestión de Proveedores (`SuppliersComponent`)**:
  - Registro de razón social, CUIT/RUT, condiciones de pago (Contado, 30 días, 60 días) y catálogo de insumos suministrados.
- **Listas de Precios de Distribución (`DistPriceListComponent`)**:
  - Definición de reglas de recargo o descuento porcentual sobre el precio base para clientes categorizados como mayoristas o distribuidores.
