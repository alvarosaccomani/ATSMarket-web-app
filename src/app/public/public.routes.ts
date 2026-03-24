import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { HomeStoreComponent } from './home-store/home-store.component';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { MarketHomeComponent } from './market-home/market-home.component';
import { StoreCatalogComponent } from './store-catalog/store-catalog.component';
import { CatalogComponent } from './catalog/catalog.component';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'market-home', component: MarketHomeComponent },
            { path: 'categories-list', component: CategoriesListComponent },
            { path: 'home-store/:slug', component: HomeStoreComponent },
            { path: 'store-catalog/:slug', component: StoreCatalogComponent },
            { path: 'catalog', component: CatalogComponent },
        ]
    }
];