# 02. Authentication and Access Control

## 1. Functional Scope and Routes
The authentication module manages user identity, account sign-up, email verification, and password resets. It is protected by `unauthGuard` to redirect already authenticated users.

| View | Route | Component | Description |
| :--- | :--- | :--- | :--- |
| **Login** | `/auth/login` | `LoginComponent` | User authentication via credentials or SSO. |
| **User Registration** | `/auth/register` | `RegisterComponent` | Account registration with dynamic password strength meter. |
| **Pending Confirmation** | `/auth/account-created/:usr_email` | `AccountCreatedComponent` | Activation instructions dispatched via email. |
| **Account Activation** | `/auth/account-confirmed/:token` | `AccountConfirmedComponent` | Verification of the activation token and welcome screen. |
| **Forgot Password** | `/auth/forgot-password` | `ForgotPasswordComponent` | Password reset link dispatch. |
| **Reset Password** | `/auth/reset-password/:token` | `ResetPasswordComponent` | Form for setting a new secure password. |
| **SSO Callback** | `/auth/sso` | `SsoCallbackComponent` | External OAuth/SSO token processing. |

---

## 2. Forms, Fields and Dynamic Validations

### Login Form (`LoginComponent`)
- **`usr_user`** (*Text / Email*, required): Accepts username or email address. Prefix icon: `user`.
- **`usr_password`** (*Password*, required): User password. Prefix icon: `lock`.
- **`Ingresar` Button**: Primary button with dynamic spinner `[nzLoading]="isSubmitting"`.
- **Quick Links**: Navigation links to `Forgot your password?` and `Sign up`.

### Registration Form (`RegisterComponent`)
- **`usr_name`** (*Text*, required, min: 2 characters): First name.
- **`usr_surname`** (*Text*, required, min: 2 characters): Last name.
- **`usr_nick`** (*Text*, required, min: 3 characters): Unique platform username.
- **`usr_email`** (*Email*, required, regex validation): Corporate or personal email.
- **`usr_password`** (*Password*, required, min: 8 characters):
  - **Live Strength Indicator**: Dynamic progress bar that evaluates four core criteria:
    1. At least one uppercase letter (`A-Z`).
    2. At least one lowercase letter (`a-z`).
    3. At least one numeric digit (`0-9`).
    4. At least one special symbol (`!@#$%^&*()_+...`).
  - **Visibility Toggle**: Interactive suffix icon `eye` / `eye-invisible` to reveal/hide plaintext password.
- **`usr_confirm_password`** (*Password*, required): Cross-field reactive validator (`updateConfirmValidator`) verifying exact equality with `usr_password`.

---

## 3. Response Handling, Notifications and Alerts
- **Successful Registration**: Redirects to `/auth/account-created/:email` accompanied by an `nz-message` success notification.
- **Credential Failure**: Emits visual feedback badges and `SweetAlert2` modal prompts on account lockouts or unverified email states.
- **Account Confirmation**: Evaluates the email token against the backend API; upon validation, displays a confirmation card and a direct action to `/auth/login`.
