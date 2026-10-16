# 02. Autenticación y Control de Accesos

## 1. Propósito Funcional y Rutas
El módulo de autenticación centraliza la identidad, el registro de usuarios, la verificación por correo electrónico y la recuperación de credenciales. Se encuentra protegido por `unauthGuard` para redirigir a usuarios ya identificados.

| Vista | Ruta | Componente | Descripción |
| :--- | :--- | :--- | :--- |
| **Inicio de Sesión** | `/auth/login` | `LoginComponent` | Autenticación mediante credenciales o SSO. |
| **Registro de Usuario** | `/auth/register` | `RegisterComponent` | Alta de nuevas cuentas con medidor dinámico de seguridad. |
| **Confirmación Pendiente** | `/auth/account-created/:usr_email` | `AccountCreatedComponent` | Instrucciones de activación enviadas por correo. |
| **Activación de Cuenta** | `/auth/account-confirmed/:token` | `AccountConfirmedComponent` | Validación del token de activación y bienvenida. |
| **Recuperar Contraseña** | `/auth/forgot-password` | `ForgotPasswordComponent` | Envío de correo para restablecimiento. |
| **Nueva Contraseña** | `/auth/reset-password/:token` | `ResetPasswordComponent` | Formulario de cambio seguro de clave. |
| **Callback SSO** | `/auth/sso` | `SsoCallbackComponent` | Procesamiento del token OAuth/SSO externo. |

---

## 2. Formularios, Campos y Validaciones Dinámicas

### Formulario de Inicio de Sesión (`LoginComponent`)
- **`usr_user`** (*Texto / Email*, requerido): Acepta nombre de usuario o correo electrónico. Icono de prefijo `user`.
- **`usr_password`** (*Contraseña*, requerida): Clave del usuario. Icono de prefijo `lock`.
- **Botón `Ingresar`**: Tipo primario con spinner `[nzLoading]="isSubmitting"`.
- **Acciones Rápidas**: Enlaces directos a `¿Olvidaste tu contraseña?` y `Regístrate`.

### Formulario de Registro (`RegisterComponent`)
- **`usr_name`** (*Texto*, requerido, min: 2 caracteres): Nombre del titular.
- **`usr_surname`** (*Texto*, requerido, min: 2 caracteres): Apellido del titular.
- **`usr_nick`** (*Texto*, requerido, min: 3 caracteres): Identificador único o alias dentro del sistema.
- **`usr_email`** (*Email*, requerido, validación regex): Correo electrónico corporativo o personal.
- **`usr_password`** (*Contraseña*, requerida, min: 8 caracteres):
  - **Medidor de Seguridad en Vivo**: Barra de progreso dinámica que evalúa cuatro requisitos obligatorios:
    1. Al menos una letra mayúscula (`A-Z`).
    2. Al menos una letra minúscula (`a-z`).
    3. Al menos un dígito numérico (`0-9`).
    4. Al menos un carácter especial (`!@#$%^&*()_+...`).
  - **Botón de Visibilidad**: Conmutador de icono `eye` / `eye-invisible` para visualizar la clave.
- **`usr_confirm_password`** (*Contraseña*, requerida): Validador cruzado reactivo (`updateConfirmValidator`) que asegura coincidencia exacta con `usr_password`.

---

## 3. Manejo de Respuestas, Notificaciones y Alertas
- **Éxito en Registro**: Redirige automáticamente a `/auth/account-created/:email` y emite un mensaje de éxito `nz-message`.
- **Error de Credenciales**: Dispara alertas visuales contextuales y modales `SweetAlert2` ante cuentas bloqueadas o correo no verificado.
- **Confirmación de Cuenta**: Al ingresar con el token de correo, se valida contra el backend; si es válido, muestra tarjeta de bienvenida y botón de acceso a `/auth/login`.
