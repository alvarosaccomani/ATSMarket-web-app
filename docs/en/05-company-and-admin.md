# 05. Company Management, Roles and Configuration

## 1. Functional Scope and Routes
This module manages multi-tenant merchants, business branches, operational parameters, and staff delegation governed by Role-Based Access Control (*RBAC*).

| View | Route | Component | Guards | Description |
| :--- | :--- | :--- | :--- | :--- |
| **My Companies** | `/application/my-companies` | `MyCompaniesComponent` | `authGuard` | Directory and active company context switcher. |
| **Company Profile** | `/application/company/:cmp_uuid` | `CompanyComponent` | `merchantGuard` | Corporate identity, logo uploading, and tax identifiers. |
| **Settings** | `/application/company-settings/:cmp_uuid` | `CompanySettingsComponent` | `roleGuard` (Admin / Owner) | Operating hours, delivery radius, currencies, and payment keys. |
| **Roles & Staff** | `/application/user-rol-company/:cmp_uuid` | `UserRolCompanyComponent` | `roleGuard` (Admin / Owner) | Staff assignment and branch permission management. |
| **Super Admin** | `/application/super-admin` | `SuperAdminComponent` | `superAdminGuard` | Global multi-tenant platform administration. |
| **Address Book** | `/application/addresses` | `AddressesComponent` | `authGuard` | Operational and billing address repository. |

---

## 2. Corporate Management and Branches (`MyCompaniesComponent`, `CompanyComponent`)
- **Active Company Context Switcher**: Selects the operating tenant. Selection instantly syncs across `SessionService` and `StoreContextService`, dynamically adjusting navigation menus and data scopes across all views.
- **Company Identity Form**:
  - `cmp_name` (*Text*, required): Legal business name or trading name.
  - `cmp_legal_id` (*Text*, required): Tax identification number (CUIT, RUT, CNPJ, Tax ID).
  - `cmp_logo` (*Image*): Image file uploader with format restrictions (PNG/JPG) and live preview.
  - `cmp_phone`, `cmp_email` (*Text / Email*): Customer support and business contact information.
  - `cmp_address` (*Text with Geolocation Picker*): Headquarters physical address.

---

## 3. Commercial Configuration (`CompanySettingsComponent`)
- **Delivery Logistics**:
  - `delivery_radius_km` (*Numeric*): Maximum coverage radius for local courier or motorcycle dispatches.
  - `min_order_amount` (*Numeric*): Minimum checkout threshold required to authorize an order.
- **Payment Gateway Credentials**:
  - Secure inputs for Mercado Pago credentials: `public_key` and `access_token` enabling direct payouts into the merchant's account.
- **Base Currency & Business Hours**:
  - Base operating currency selector (`ARS`, `USD`, `BRL`, `EUR`) driving price catalogs.
  - Weekly schedule matrix for opening and closing hours featuring a real-time *Open / Closed* status indicator.

---

## 4. Access Control and Staff Roles (`UserRolCompanyComponent`)
- **Staff Directory**: Interactive table listing avatar, email address, assigned role, and status tag (`Active` / `Inactive`).
- **User Invitation Modal**:
  - `usr_email` (*Email*, required): Staff email address.
  - `rol_uuid` (*Dropdown*): Role assignment:
    - `Owner` / `Admin`: Full operational, configuration, and financial control.
    - `Warehouse Manager`: Inventory control, stock adjustments, and warehouse audits.
    - `Order Dispatcher`: Order packing, barcode verification, and fulfillment.
    - `Sales Representative`: Order queries and in-store billing.
- **Quick Controls**: Instant toggle switch for staff activation/deactivation and revoke access action with confirmation alert.
