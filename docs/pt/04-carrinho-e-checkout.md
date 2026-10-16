# 04. Carrinho de Compras e Checkout Multiloja

## 1. Escopo Funcional e Rotas
O fluxo de compras permite reunir mercadorias de diferentes lojas em um único carrinho, escolher endereços com geolocalização precisa no mapa, calcular fretes individuais por loja e concluir o pagamento com Mercado Pago.

| Tela | Rota | Componente | Acesso | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Carrinho de Compras** | `/user/cart` | `CartComponent` | Público | Lista de itens agrupada por loja, cálculo de subtotais e ajuste de quantidades. |
| **Fluxo de Checkout** | `/user/checkout` | `CheckoutComponent` | `authGuard` | Assistente em etapas: Endereço, Frete, Cupons e Pagamento. |

---

## 2. Operações no Carrinho de Compras (`CartComponent`)
- **Agrupamento por Estabelecimento (`StoreOrderGroup`)**: Os produtos são exibidos em blocos separados por loja vendedora para total clareza logística.
- **Ações nos Itens**:
  - Ajuste de Quantidade: Botões de incremento `+` e decremento `-` com atualização reativa no `localStorage`.
  - Exclusão de Item: Ícone `delete` com confirmação obrigatória (`nz-popconfirm`).
  - Limpar Carrinho: Limpeza total com modal de confirmação.
- **Resumo Financeiro**:
  - Subtotal acumulado de produtos.
  - Alerta contextual informando a necessidade de login para prosseguir ao pagamento.
- **Botão `Iniciar Compra`**: Valida a disponibilidade dos itens e direciona para `/user/checkout`.

---

## 3. Assistente de Checkout Passo a Passo (`CheckoutComponent`)

O processo de compra utiliza um indicador sequencial (`nz-steps`):

### Etapa 1: Endereço de Entrega
- **Seleção de Endereços Cadastrados**: Lista de cartões com os endereços registrados do usuário.
- **Cadastro de Novo Endereço**:
  - Campos: Rua, Número, Complemento, Cidade, CEP e Ponto de Referência.
  - **Mapeador Geográfico Interativo (`MapPickerComponent`)**: Mapa integrado com MapLibre para posicionamento do marcador exato de entrega.

### Etapa 2: Frete e Cupons de Desconto por Loja
- **Opções de Envio por Estabelecimento**:
  - `moto`: Entrega expressa por motoboy (ativo se o endereço estiver dentro do raio de atendimento).
  - `correo`: Serviço postal nacional com opções dinâmicas:
    - `correo_std`: Encomenda padrão.
    - `correo_exp`: Encomenda expressa.
    - `correo_priority`: Envio prioritário de urgência.
  - `retiro`: Retirada gratuita no balcão da loja.
  - `acordar`: Combinação direta de entrega entre cliente e vendedor.
- **Validação de Cupons de Desconto**:
  - Campo `Código de cupón` com botão `Aplicar`.
  - Validação síncrona com `CouponsService`: checagem de vigência, valor mínimo do pedido e limites de uso.
  - Exibição imediata do desconto e recálculo do valor total.

### Etapa 3: Meios de Pagamento
- **Mercado Pago Checkout Brick (`MpPaymentBrickComponent`)**:
  - Formulário seguro integrado para cartões de crédito, débito e saldo Mercado Pago.
  - Parcelamento, validação de CVV e tokenização de segurança PCI.
  - Meios alternativos: Pagamento em dinheiro na entrega (*Cash on Delivery*) ou transferência bancária.

---

## 4. Finalização e Confirmação de Compra
1. Disparo de requisições simultâneas para `OrdersService`, `StockMovementsService` e `InventoryStocksService` para reserva de estoque nos armazéns.
2. Emissão de alerta em tempo real via `WebSocketNotificationService` para o painel do lojista.
3. Exibição da tela de confirmação contendo os números dos pedidos criados e botão para acompanhamento em `/application/my-purchases`.
