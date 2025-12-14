import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'public',
        loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES),
    },
    {
        path: 'user',
        loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
    },
    {
        path: 'application',
        loadChildren: () => import('./application/application.routes').then(m => m.APPLICATION_ROUTES),
    },
    { path: '**', redirectTo: 'public/home' }
];
