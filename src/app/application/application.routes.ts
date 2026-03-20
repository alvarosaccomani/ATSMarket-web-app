import { Routes } from '@angular/router';

import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { MyCompaniesComponent } from './my-companies/my-companies.component';
import { CompanyComponent } from './company/company.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { PriceListComponent } from './price-list/price-list.component';
import { DistPriceListComponent } from './dist-price-list/dist-price-list.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { ProductVariationComponent } from './product-variation/product-variation.component';

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
            { path: 'products', component: ProductsComponent },
            { path: 'product/:pro_uuid', component: ProductComponent },
            { path: 'product-variation/:pro_uuid/:prov_uuid', component: ProductVariationComponent }
        ]
    }
];