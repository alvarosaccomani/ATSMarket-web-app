import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { HomeComponent } from './home/home.component';
import { MarketHomeComponent } from './market-home/market-home.component';
import { StoreComponent } from './store/store.component';
import { CatalogComponent } from './catalog/catalog.component';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'market-home', component: MarketHomeComponent },
            { path: 'store/:slug', component: StoreComponent },
            { path: 'catalog', component: CatalogComponent },
        ]
    }
];