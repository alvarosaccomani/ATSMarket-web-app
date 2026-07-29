import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AccountCreatedComponent } from './account-created/account-created.component';
import { AccountConfirmedComponent } from './account-confirmed/account-confirmed.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SsoCallbackComponent } from './sso-callback/sso-callback.component';
import { unauthGuard } from '@guards/unauth.guard';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        canActivate: [unauthGuard],
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'account-created/:usr_email', component: AccountCreatedComponent },
            { path: 'account-confirmed/:usr_ConfirmationToken', component: AccountConfirmedComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password/:usr_ResetPasswordToken', component: ResetPasswordComponent },
            { path: 'sso', component: SsoCallbackComponent }
        ]
    }
];
