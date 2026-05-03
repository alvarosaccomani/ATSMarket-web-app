import { Routes } from '@angular/router';

import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { MyCompaniesComponent } from './my-companies/my-companies.component';
import { CompanyComponent } from './company/company.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { PriceListComponent } from './price-list/price-list.component';
import { DistPriceListComponent } from './dist-price-list/dist-price-list.component';
import { GlobalItemsComponent } from './global-items/global-items.component';
import { GlobalItemComponent } from './global-item/global-item.component';
import { GlobalCategoriesComponent } from './global-categories/global-categories.component';
import { GlobalCategoryComponent } from './global-category/global-category.component';
import { GlobalMaterialsComponent } from './global-materials/global-materials.component';
import { GlobalMaterialComponent } from './global-material/global-material.component';
import { MaterialsComponent } from './materials/materials.component';
import { MaterialComponent } from './material/material.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { ProductVariationComponent } from './product-variation/product-variation.component';
import { OrdersReceivedComponent } from './orders-received/orders-received.component';
import { CustomersComponent } from './customers/customers.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { FinancesComponent } from './finances/finances.component';
import { AddressesComponent } from './addresses/addresses.component';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        component: ApplicationLayoutComponent,
        children: [
            { path: 'my-companies', component: MyCompaniesComponent },
            { path: 'company/:cmp_uuid', component: CompanyComponent },
            { path: 'company-settings/:cmp_uuid', component: CompanySettingsComponent },
            { path: 'price-list', component: PriceListComponent },
            { path: 'dist-price-list', component: DistPriceListComponent },
            { path: 'global-items', component: GlobalItemsComponent },
            { path: 'global-item/:gitm_uuid', component: GlobalItemComponent },
            { path: 'global-categories', component: GlobalCategoriesComponent },
            { path: 'global-category/:gitm_uuid/:gcat_uuid', component: GlobalCategoryComponent },
            { path: 'global-materials', component: GlobalMaterialsComponent },
            { path: 'global-material/:gmat_uuid', component: GlobalMaterialComponent },
            { path: 'materials', component: MaterialsComponent },
            { path: 'material/:mat_uuid', component: MaterialComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'product/:pro_uuid', component: ProductComponent },
            { path: 'product-variation/:pro_uuid/:prov_uuid', component: ProductVariationComponent },
            { path: 'orders-received', component: OrdersReceivedComponent },
            { path: 'customers', component: CustomersComponent },
            { path: 'suppliers', component: SuppliersComponent },
            { path: 'analytics', component: AnalyticsComponent },
            { path: 'finances', component: FinancesComponent },
            { path: 'addresses', component: AddressesComponent }
        ]
    }
];