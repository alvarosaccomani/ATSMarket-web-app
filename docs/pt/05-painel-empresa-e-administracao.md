# 05. Gestão de Empresas, Funções e Configuração

## 1. Escopo Funcional e Rotas
Este módulo centraliza a administração multitenant de estabelecimentos, filiais, parâmetros operacionais e delegação de colaboradores sob Controle de Acesso Baseado em Funções (*RBAC*).

| Tela | Rota | Componente | Guardas | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Minhas Empresas** | `/application/my-companies` | `MyCompaniesComponent` | `authGuard` | Catálogo e seletor de contexto da empresa ativa. |
| **Cadastro da Empresa** | `/application/company/:cmp_uuid` | `CompanyComponent` | `merchantGuard` | Identidade visual, logotipo e dados fiscais. |
| **Configurações** | `/application/company-settings/:cmp_uuid` | `CompanySettingsComponent` | `roleGuard` (Admin / Owner) | Horários, raio de entrega, moedas e chaves de pagamento. |
| **Funções e Usuários** | `/application/user-rol-company/:cmp_uuid` | `UserRolCompanyComponent` | `roleGuard` (Admin / Owner) | Vínculo de colaboradores e permissões por filial. |
| **Super Administrador** | `/application/super-admin` | `SuperAdminComponent` | `superAdminGuard` | Administração global multitenant da plataforma. |
| **Endereços** | `/application/addresses` | `AddressesComponent` | `authGuard` | Catálogo de endereços operacionais e fiscais. |

---

## 2. Gestão Corporativa e Filiais (`MyCompaniesComponent`, `CompanyComponent`)
- **Seletor de Empresa Ativa**: Define o estabelecimento de trabalho atual. A alteração propaga-se de imediato pelo `SessionService` e `StoreContextService`, adaptando o menu e o escopo de dados de todas as telas.
- **Formulário de Dados da Empresa**:
  - `cmp_name` (*Texto*, obrigatório): Razão social ou nome fantasia.
  - `cmp_legal_id` (*Texto*, obrigatório): Inscrição tributária (CNPJ, CUIT, CPF).
  - `cmp_logo` (*Imagem*): Upload de imagem com validação de formato (PNG/JPG) e pré-visualização.
  - `cmp_phone`, `cmp_email` (*Texto / E-mail*): Informações de contato e atendimento ao cliente.
  - `cmp_address` (*Texto com Seletor Geográfico*): Localização física da matriz ou filial.

---

## 3. Parametrização Comercial (`CompanySettingsComponent`)
- **Logística de Entrega**:
  - `delivery_radius_km` (*Numérico*): Raio máximo de cobertura para entregas locais via motoboy.
  - `min_order_amount` (*Numérico*): Valor mínimo de pedido para conclusão da compra.
- **Credenciais de Gateway de Pagamento**:
  - Campos protegidos para chaves do Mercado Pago: `public_key` e `access_token` para repasse direto à conta do lojista.
- **Moeda Padrão e Horários de Atendimento**:
  - Definição da moeda base (`BRL`, `USD`, `ARS`, `EUR`) para precificação.
  - Grade de horários de funcionamento semanal com indicador visual *Aberto / Fechado*.

---

## 4. Gestão de Equipe e Permissões (`UserRolCompanyComponent`)
- **Quadro de Colaboradores**: Tabela com avatar, e-mail, função associada e tag de status (`Ativo` / `Inativo`).
- **Modal de Vinculação de Usuário**:
  - `usr_email` (*E-mail*, obrigatório): E-mail do membro da equipe.
  - `rol_uuid` (*Seletor*): Atribuição de perfil:
    - `Owner` / `Admin`: Acesso administrativo e financeiro total.
    - `Encarregado de Estoque`: Gestão de saldo, movimentações e auditoria física.
    - `Expedição de Pedidos`: Separação, conferência por código de barras e despacho.
    - `Atendimento / Vendas`: Consulta de pedidos e faturamento no balcão.
- **Ações Imediatas**: Chave seletora para ativação/desativação instantânea e revogação de acessos com confirmação.
