import { Routes } from '@angular/router';

import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { MenuItemsComponent } from './menu-items/menu-items.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MyCompaniesComponent } from './my-companies/my-companies.component';
import { CompanyComponent } from './company/company.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { UserRolCompanyComponent } from './user-rol-company/user-rol-company.component';
import { PriceListComponent } from './price-list/price-list.component';
import { DistPriceListComponent } from './dist-price-list/dist-price-list.component';
import { GlobalItemsComponent } from './global-items/global-items.component';
import { GlobalItemComponent } from './global-item/global-item.component';
import { GlobalCategoriesComponent } from './global-categories/global-categories.component';
import { GlobalCategoryComponent } from './global-category/global-category.component';
import { GlobalMaterialsComponent } from './global-materials/global-materials.component';
import { GlobalMaterialComponent } from './global-material/global-material.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { ItemsComponent } from './items/items.component';
import { MaterialsComponent } from './materials/materials.component';
import { MaterialComponent } from './material/material.component';
import { WarehousesComponent } from './warehouses/warehouses.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { ProductVariationComponent } from './product-variation/product-variation.component';
import { InventoryAuditComponent } from './inventory-audit/inventory-audit.component';
import { OrdersReceivedComponent } from './orders-received/orders-received.component';
import { MyPurchasesComponent } from './my-purchases/my-purchases.component';
import { CustomersComponent } from './customers/customers.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { SupplierComponent } from './supplier/supplier.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { FinancesComponent } from './finances/finances.component';
import { AddressesComponent } from './addresses/addresses.component';

import { authGuard } from '@guards/auth.guard';
import { superAdminGuard } from '@guards/super-admin.guard';
import { roleGuard } from '@guards/role.guard';
import { merchantGuard } from '@guards/merchant.guard';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        component: ApplicationLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'menu-items', component: MenuItemsComponent, canActivate: [merchantGuard] },
            { path: 'menu-item/:mnu_uuid', component: MenuItemComponent, canActivate: [merchantGuard] },
            { path: 'my-companies', component: MyCompaniesComponent },
            { path: 'company/:cmp_uuid', component: CompanyComponent, canActivate: [merchantGuard] },
            { path: 'company-settings/:cmp_uuid', component: CompanySettingsComponent, canActivate: [merchantGuard, roleGuard], data: { expectedRoles: ['admin', 'administrador', 'owner'] } },
            { path: 'user-rol-company/:cmp_uuid', component: UserRolCompanyComponent, canActivate: [merchantGuard, roleGuard], data: { expectedRoles: ['admin', 'administrador', 'owner'] } },
            { path: 'price-list', component: PriceListComponent, canActivate: [merchantGuard] },
            { path: 'dist-price-list', component: DistPriceListComponent, canActivate: [merchantGuard] },
            { path: 'global-items', component: GlobalItemsComponent, canActivate: [merchantGuard] },
            { path: 'global-item/:gitm_uuid', component: GlobalItemComponent, canActivate: [merchantGuard] },
            { path: 'global-categories', component: GlobalCategoriesComponent, canActivate: [merchantGuard] },
            { path: 'global-category/:gitm_uuid/:gcat_uuid', component: GlobalCategoryComponent, canActivate: [merchantGuard] },
            { path: 'global-materials', component: GlobalMaterialsComponent, canActivate: [merchantGuard] },
            { path: 'global-material/:gmat_uuid', component: GlobalMaterialComponent, canActivate: [merchantGuard] },
            { path: 'super-admin', component: SuperAdminComponent, canActivate: [superAdminGuard] },
            { path: 'items', component: ItemsComponent, canActivate: [merchantGuard] },
            { path: 'materials', component: MaterialsComponent, canActivate: [merchantGuard] },
            { path: 'material/:mat_uuid', component: MaterialComponent, canActivate: [merchantGuard] },
            { path: 'warehouses', component: WarehousesComponent, canActivate: [merchantGuard] },
            { path: 'products', component: ProductsComponent, canActivate: [merchantGuard] },
            { path: 'product/:pro_uuid', component: ProductComponent, canActivate: [merchantGuard] },
            { path: 'product-variation/:pro_uuid/:prov_uuid', component: ProductVariationComponent, canActivate: [merchantGuard] },
            { path: 'inventory-audit', component: InventoryAuditComponent, canActivate: [merchantGuard] },
            { path: 'orders-received', component: OrdersReceivedComponent, canActivate: [merchantGuard] },
            { path: 'my-purchases', component: MyPurchasesComponent },
            { path: 'customers', component: CustomersComponent, canActivate: [merchantGuard] },
            { path: 'suppliers', component: SuppliersComponent, canActivate: [merchantGuard] },
            { path: 'supplier/:sup_uuid', component: SupplierComponent, canActivate: [merchantGuard] },
            { path: 'analytics', component: AnalyticsComponent, canActivate: [merchantGuard] },
            { path: 'finances', component: FinancesComponent, canActivate: [merchantGuard, roleGuard], data: { expectedRoles: ['admin', 'administrador', 'owner'] } },
            { path: 'addresses', component: AddressesComponent }
        ]
    }
];