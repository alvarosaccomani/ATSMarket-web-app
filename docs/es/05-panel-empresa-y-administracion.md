# 05. Gestión de Empresas, Roles y Configuración

## 1. Propósito Funcional y Rutas
Este módulo nuclea la administración multitenant de comercios, sucursales, parametrizaciones comerciales y asignación de colaboradores con control de acceso basado en roles (*RBAC*).

| Vista | Ruta | Componente | Guardias | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Mis Empresas** | `/application/my-companies` | `MyCompaniesComponent` | `authGuard` | Listado y selección de contexto activo de empresas. |
| **Ficha de Empresa** | `/application/company/:cmp_uuid` | `CompanyComponent` | `merchantGuard` | Edición de identidad corporativa, logotipo y datos fiscales. |
| **Configuraciones** | `/application/company-settings/:cmp_uuid` | `CompanySettingsComponent` | `roleGuard` (Admin / Owner) | Horarios, radio de entrega, monedas y llaves de pago. |
| **Roles y Usuarios** | `/application/user-rol-company/:cmp_uuid` | `UserRolCompanyComponent` | `roleGuard` (Admin / Owner) | Asignación de colaboradores y permisos por sucursal. |
| **Super Administrador** | `/application/super-admin` | `SuperAdminComponent` | `superAdminGuard` | Gestión global multitenant de la plataforma. |
| **Mis Domicilios** | `/application/addresses` | `AddressesComponent` | `authGuard` | Libreta de direcciones operativas y de facturación. |

---

## 2. Gestión Corporativa y Sucursales (`MyCompaniesComponent`, `CompanyComponent`)
- **Conmutador de Empresa Activa**: Permite seleccionar el comercio de trabajo. La elección se sincroniza inmediatamente con `SessionService` y `StoreContextService`, adaptando el menú y el alcance de datos de todas las pantallas.
- **Formulario de Identidad de Comercio**:
  - `cmp_name` (*Texto*, requerido): Razón social o nombre de fantasía.
  - `cmp_legal_id` (*Texto*, requerido): Identificación tributaria (CUIT, RUT, CNPJ).
  - `cmp_logo` (*Imagen*): Carga de imagen con validación de formato (PNG/JPG) y previsualización.
  - `cmp_phone`, `cmp_email` (*Texto / Email*): Datos de contacto comercial.
  - `cmp_address` (*Texto con selector geográfico*): Geolocalización de la casa matriz.

---

## 3. Parametrización Comercial (`CompanySettingsComponent`)
- **Operaciones de Entrega**:
  - `delivery_radius_km` (*Numérico*): Radio máximo de cobertura para envíos en moto o cadetería local.
  - `min_order_amount` (*Numérico*): Importe mínimo de compra requerido para autorizar un pedido.
- **Configuración de Pasarelas de Pago**:
  - Campos seguros para Credenciales de Mercado Pago: `public_key` y `access_token` para cobros directos a la cuenta del vendedor.
- **Moneda Base y Horarios de Atención**:
  - Selección de divisa predeterminada (`ARS`, `USD`, `BRL`, `EUR`) para listados de precios.
  - Matriz semanal de turnos de apertura y cierre con estado visual *Abierto / Cerrado*.

---

## 4. Control de Acceso y Colaboradores (`UserRolCompanyComponent`)
- **Listado de Equipo**: Tabla con foto de perfil, correo, rol asignado y badge de estado (`Activo` / `Inactivo`).
- **Modal de Vinculación de Usuario**:
  - `usr_email` (*Email*, requerido): Correo del colaborador.
  - `rol_uuid` (*Selector*): Asignación de rol:
    - `Owner` / `Admin`: Control administrativo y financiero total.
    - `Encargado de Almacén`: Gestión de stock, movimientos y auditorías de inventario.
    - `Operador de Pedidos`: Despacho, escaneo y atención de órdenes recibidas.
    - `Ventas / Mostrador`: Emisión de comprobantes y consultas.
- **Acciones Rápidas**: Conmutador de activación/desactivación en tiempo real y botón de revocación con alerta de confirmación.
