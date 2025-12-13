import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { HomeComponent } from './home/home.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PriceListComponent } from './price-list/price-list.component';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'price-list', component: PriceListComponent },
        ]
    }
];