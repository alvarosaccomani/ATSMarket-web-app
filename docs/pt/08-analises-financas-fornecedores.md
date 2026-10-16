# 08. Análise de Negócios, Finanças e Fornecedores

## 1. Escopo Funcional e Rotas
Este módulo oferece inteligência de vendas e gestão financeira para os administradores do negócio, englobando gráficos interativos com **ECharts**, conciliação de recebíveis digitais e em dinheiro, acerto de contas com entregadores e gestão de fornecedores.

| Tela | Rota | Componente | Guardas | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Painel de Análises** | `/application/analytics` | `AnalyticsComponent` | `merchantGuard` | Indicadores de vendas, gráficos ECharts, ticket médio e produtos líderes. |
| **Gestão Financeira** | `/application/finances` | `FinancesComponent` | `roleGuard` (Admin / Owner) | Saldo em caixa, saques para conta bancária e acerto com motoboys. |
| **Carteira de Clientes** | `/application/customers` | `CustomersComponent` | `merchantGuard` | Diretório CRM de compradores, volume de compras e contatos. |
| **Fornecedores** | `/application/suppliers` | `SuppliersComponent` | `merchantGuard` | Cadastro de fornecedores, prazos de faturamento e tabela de custos. |
| **Ficha de Fornecedor** | `/application/supplier/:sup_uuid` | `SupplierComponent` | `merchantGuard` | Informações de contato e matérias-primas adquiridas. |
| **Tabelas de Preço** | `/application/price-list`, `/dist-price-list` | `PriceListComponent`, `DistPriceListComponent` | `merchantGuard` | Escalas de preço de varejo e atacado para distribuidores. |

---

## 2. Indicadores e Gráficos de Desempenho (`AnalyticsComponent`)
- **Filtro Temporal Dinâmico**: Seleção rápida de período (Hoje, Últimos 7 Dias, Mês Vigente, Período Customizado).
- **Cartões de Indicadores Estratégicos (`nz-statistic`)**:
  - Faturamento bruto consolidado.
  - Total de pedidos finalizados.
  - Ticket médio por compra.
  - Taxa de conversão de pedidos concluídos.
- **Gráficos Interativos com ECharts**:
  - Gráfico de Linha / Área: Evolução cronológica do faturamento diário.
  - Gráfico de Barras: Ranking dos 5 produtos com maior faturamento e giro de estoque.
  - Gráfico Donut: Distribuição das receitas por forma de pagamento (Mercado Pago versus Dinheiro na entrega).

---

## 3. Finanças, Saques e Fechamento de Entregadores (`FinancesComponent`)
- **Separação de Saldos**:
  - Saldo Disponível na Plataforma Digital (Mercado Pago).
  - Valores em espécie recebidos no balcão ou nas entregas.
- **Gestão de Transferências (`PayoutEvent`)**:
  - Solicitação de saque para conta bancária via chave PIX / dados bancários.
  - Estados do saque: `PENDING`, `COMPLETED`, `REJECTED` com comprovante de liquidação anexado.
- **Acerto de Contas com Entregadores (`RiderSettlementViewModel`)**:
  - Central de conciliação diária por motoboy: Quantidade de corridas realizadas, valor teórico recebido em dinheiro e botão de encerramento de turno.

---

## 4. CRM, Gestão de Fornecedores e Preços Especiais
- **Controle de Fornecedores (`SuppliersComponent`)**:
  - Cadastro de razão social, CNPJ, prazos de pagamento (À vista, 30 dias, 60 dias) e catálogo de insumos fornecidos.
- **Tabela de Preços para Distribuidores (`DistPriceListComponent`)**:
  - Criação de políticas de margem percentual ou descontos escalonados para compradores no atacado.
