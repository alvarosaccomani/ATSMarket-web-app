# 07. Gestão de Pedidos, Compras e Cupons

## 1. Escopo Funcional e Rotas
Este módulo atende ao fluxo de atendimento de pedidos das lojas, ao rastreamento de compras por parte dos clientes, ao mecanismo de fidelização por cupons promocionais e à lista de desejos.

| Tela | Rota | Componente | Guardas | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Pedidos Recebidos** | `/application/orders-received` | `OrdersReceivedComponent` | `merchantGuard` | Mesa de expedição, esteira de status, chat e emissão de romaneios. |
| **Minhas Compras** | `/application/my-purchases` | `MyPurchasesComponent` | `authGuard` | Histórico de pedidos do cliente com linha do tempo interativa. |
| **Cupons Promocionais** | `/application/coupons` | `CouponsComponent` | `merchantGuard` | Gerador e administração de códigos promocionais. |
| **Meus Favoritos** | `/application/my-favorites` | `MyFavoritesComponent` | `authGuard` | Lista de desejos e atalho para recompra frequente. |

---

## 2. Central de Expedição de Pedidos (`OrdersReceivedComponent`)
- **Abas de Esteira Logística (`nz-tabs`)**:
  - `Todos`: Histórico consolidado de todas as transações.
  - `Pendientes`: Pedidos recém-criados aguardando confirmação do lojista.
  - `Confirmados`: Pagamentos verificados ou pedidos de cobrança na entrega aprovados.
  - `En Preparación`: Pedidos em processo de separação e embalagem no armazém.
  - `Despachados`: Pedidos em trânsito com motoboy ou código de rastreamento postal.
  - `Entregados`: Transações concluídas com sucesso.
  - `Cancelados`: Pedidos cancelados com estorno automático de estoque.
- **Painel Lateral de Detalhes (`nz-drawer`)**:
  - Ficha cadastral do comprador: Nome completo, telefone e e-mail.
  - Endereço de destino com coordenadas no mapa e instruções de entrega.
  - Discriminação de itens, preços unitários, variações, subtotal e cupom de desconto aplicado.
- **Canal de Atendimento em Tempo Real (`ChatService`)**:
  - Chat lateral embutido para conversação direta entre comprador e vendedor via WebSockets.
- **Emissão de Romaneios e Faturas**:
  - Botão `Imprimir Remito`: Geração direta no navegador de documentos PDF de despacho com `jspdf` e `jspdf-autotable`.
- **Conferência por Código de Barras (`BarcodeScannerComponent`)**:
  - Leitura física dos produtos antes de fechar a embalagem para evitar erros de despacho.

---

## 3. Rastreamento de Compras (`MyPurchasesComponent`)
- **Linha do Tempo Visual**: Acompanhamento etapa a etapa (Pedido Realizado -> Em Separação -> A Caminho -> Entregue).
- **Ações Disponíveis**:
  - Download de comprovantes de compra.
  - Acesso direto ao chat com o vendedor para esclarecimento de dúvidas.
  - Botão `Volver a Comprar` para reinserir instantaneamente os produtos no carrinho atual.

---

## 4. Gestão de Cupons Promocionais (`CouponsComponent`)
- **Configuração de Novo Cupom**:
  - `coup_code` (*Texto*, obrigatório): Código em letras maiúsculas (ex: `VERAO2026`).
  - `coup_type` (*Seletor*): Regra de desconto: `percentage` (percentual sobre o subtotal) ou `fixed` (valor nominal fixo).
  - `coup_value` (*Numérico*, obrigatório): Valor nominal ou alíquota percentual do desconto.
  - `coup_min_amount` (*Numérico*): Valor mínimo de mercadoria no carrinho para elegibilidade.
  - `coup_expiration` (*Data / Hora*): Prazo limite de validade.
  - `coup_max_uses` (*Numérico*): Limite global de utilizações permitidas.
- **Controle Operacional**: Alternador instantâneo `Ativo / Inativo` e contador em tempo real de resgates realizados.
