# 01. Introdução e Arquitetura Geral

## 1. Visão Geral do Sistema
O **ATSMarket** é uma plataforma de comércio eletrônico multiloja (B2B / B2C) e gestão operacional desenvolvida em **Angular 19**. A aplicação adota arquitetura baseada em componentes autônomos (*standalone components*), programação reativa com **RxJS** e o sistema de design corporativo fornecido pelo **Ng-Zorro Ant Design**.

O sistema atende a fluxos operacionais completos:
- **Público**: Descoberta de estabelecimentos, navegação no catálogo global por categorias e materiais, visualização de produtos e variações.
- **Cliente**: Carrinho persistente multiloja, cotação dinâmica de frete, aplicação de cupons e checkout integrado com Mercado Pago.
- **Empresas / Vendedores (Merchants)**: Painel de controle integral para gestão de filiais, armazéns físicos, controle e auditoria de estoque por leitor de código de barras, listas de preços diferenciadas, recebimento de pedidos em tempo real via WebSockets e conciliação financeira.
- **Super Administrador**: Administração multitenant de empresas e parametrização mestra do sistema.

---

## 2. Mapa de Rotas Principais
A navegação é dividida em módulos protegidos por *Guards* de segurança:

| Módulo | Prefixo de Rota | Acesso e Guardas | Descrição |
| :--- | :--- | :--- | :--- |
| **Autenticação** | `/auth/*` | `unauthGuard` | Cadastro, Login, Recuperação de senha e confirmação de conta. |
| **Público** | `/public/*` | Público | Página inicial do marketplace, catálogo geral, lojas individuais e ficha técnica de produtos. |
| **Cliente / Transacional** | `/user/*` | `authGuard` (Checkout) | Carrinho de compras e fluxo de checkout. |
| **Painel de Controle** | `/application/*` | `authGuard`, `merchantGuard`, `roleGuard`, `superAdminGuard` | Gestão empresarial, estoque, pedidos recebidos, finanças e relatórios analíticos. |

---

## 3. Padrões Visuais e Estados de Interface
Padrões visuais consistentes são mantidos em todas as telas:
- **Alertas e Notificações**: Mensagens flutuantes (`nz-message`), diálogos de confirmação com `SweetAlert2` e banners de aviso contextual (`nz-alert`).
- **Estados de Carregamento**: Indicadores de progresso `nz-spin` sobre tabelas, botões com estado `[nzLoading]="true"` para evitar envios duplicados, e placeholders com `nz-skeleton`.
- **Badges e Tags de Estado (`nz-tag`)**:
  - `blue` / `processing`: Estados pendentes ou processos em andamento.
  - `green` / `success`: Operações concluídas, pedidos entregues ou pagamentos confirmados.
  - `orange` / `warning`: Alertas de estoque baixo, pedidos aguardando pagamento ou pendências cadastrais.
  - `red` / `error`: Pedidos cancelados, falhas transacionais ou estoque esgotado.
- **Painéis Laterais (`nz-drawer`)**: Utilizados para filtros avançados e visualização de dados detalhados sem perder o contexto da listagem.
