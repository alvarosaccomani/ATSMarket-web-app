import { Routes } from '@angular/router';

import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { PriceListComponent } from './price-list/price-list.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        component: ApplicationLayoutComponent,
        children: [
            { path: 'price-list', component: PriceListComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'product/:pro_uuid', component: ProductComponent }
        ]
    }
];