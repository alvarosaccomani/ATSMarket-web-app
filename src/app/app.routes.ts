import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'public',
        loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES),
    }
];
