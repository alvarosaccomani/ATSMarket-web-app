import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { HomeStoreComponent } from './home-store/home-store.component';
import { MarketHomeComponent } from './market-home/market-home.component';
import { StoreComponent } from './store/store.component';
import { CatalogComponent } from './catalog/catalog.component';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'market-home', component: MarketHomeComponent },
            { path: 'home-store', component: HomeStoreComponent },
            { path: 'store/:slug', component: StoreComponent },
            { path: 'catalog', component: CatalogComponent },
        ]
    }
];