# 02. Autenticação e Controle de Acesso

## 1. Escopo Funcional e Rotas
O módulo de autenticação gerencia a identidade do usuário, registro de novas contas, validação de e-mail e recuperação de credenciais. É protegido pelo `unauthGuard` para redirecionar usuários já logados.

| Tela | Rota | Componente | Descrição |
| :--- | :--- | :--- | :--- |
| **Login** | `/auth/login` | `LoginComponent` | Acesso por usuário/senha ou integração SSO. |
| **Cadastro de Usuário** | `/auth/register` | `RegisterComponent` | Criação de conta com medidor dinâmico de força de senha. |
| **Confirmação Pendente** | `/auth/account-created/:usr_email` | `AccountCreatedComponent` | Orientações de validação enviadas por e-mail. |
| **Ativação de Conta** | `/auth/account-confirmed/:token` | `AccountConfirmedComponent` | Validação do token recebido e confirmação de ativação. |
| **Esqueci Minha Senha** | `/auth/forgot-password` | `ForgotPasswordComponent` | Solicitação de link para redefinição de senha. |
| **Redefinir Senha** | `/auth/reset-password/:token` | `ResetPasswordComponent` | Formulário seguro para definição da nova senha. |
| **Callback SSO** | `/auth/sso` | `SsoCallbackComponent` | Recepção do token externo de autenticação OAuth/SSO. |

---

## 2. Formulários, Campos e Validações Dinâmicas

### Formulário de Login (`LoginComponent`)
- **`usr_user`** (*Texto / E-mail*, obrigatório): Nome de usuário ou endereço de e-mail. Ícone de prefixo: `user`.
- **`usr_password`** (*Senha*, obrigatória): Senha do usuário. Ícone de prefixo: `lock`.
- **Botão `Ingresar`**: Botão primário com indicador de processamento `[nzLoading]="isSubmitting"`.
- **Links de Navegação**: Acesso direto a `¿Olvidaste tu contraseña?` e `Regístrate`.

### Formulário de Cadastro (`RegisterComponent`)
- **`usr_name`** (*Texto*, obrigatório, mín: 2 caracteres): Nome do titular.
- **`usr_surname`** (*Texto*, obrigatório, mín: 2 caracteres): Sobrenome do titular.
- **`usr_nick`** (*Texto*, obrigatório, mín: 3 caracteres): Nome de usuário único na plataforma.
- **`usr_email`** (*E-mail*, obrigatório, validação regex): E-mail pessoal ou corporativo.
- **`usr_password`** (*Senha*, obrigatória, mín: 8 caracteres):
  - **Medidor de Força em Tempo Real**: Barra de progresso dinâmica que valida quatro critérios:
    1. Pelo menos uma letra maiúscula (`A-Z`).
    2. Pelo menos uma letra minúscula (`a-z`).
    3. Pelo menos um dígito numérico (`0-9`).
    4. Pelo menos um caractere especial (`!@#$%^&*()_+...`).
  - **Alternador de Visibilidade**: Ícone sufixo `eye` / `eye-invisible` para exibir/ocultar senha digitada.
- **`usr_confirm_password`** (*Senha*, obrigatória): Validação reativa cruzada (`updateConfirmValidator`) que exige correspondência idêntica a `usr_password`.

---

## 3. Gestão de Respostas, Notificações e Alertas
- **Sucesso no Cadastro**: Redirecionamento para `/auth/account-created/:email` acompanhado por notificação `nz-message`.
- **Falha de Acesso**: Notificações contextuais e modais `SweetAlert2` em caso de conta inativa ou dados incorretos.
- **Confirmação de Conta**: Ao acessar a URL com o token, valida-se o status na API; com sucesso, exibe cartão de boas-vindas com atalho para login.
