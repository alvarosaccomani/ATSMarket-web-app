# 06. Estoque, Produtos, Variações e Armazéns

## 1. Escopo Funcional e Rotas
Este módulo gerencia o ciclo de vida dos produtos, a geração matricial de variações (tamanhos, cores, matérias-primas), a topologia física dos armazéns e a auditoria de estoque com leitor de código de barras.

| Tela | Rota | Componente | Guardas | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Lista de Produtos** | `/application/products` | `ProductsComponent` | `merchantGuard` | Catálogo de itens, preços, filtros e operações em lote. |
| **Criar / Editar Produto** | `/application/product/:pro_uuid` | `ProductComponent` | `merchantGuard` | Cadastro principal, categorização, preços e imagens. |
| **Variações Globais** | `/application/products-variations` | `ProductsVariationsComponent` | `merchantGuard` | Combinações de atributos e saldo por variante. |
| **Detalhe da Variação** | `/application/product-variation/:pro_uuid/:prov_uuid` | `ProductVariationComponent` | `merchantGuard` | Atributos específicos, SKU individual e ajuste de valor. |
| **Armazéns e Prateleiras** | `/application/warehouses` | `WarehousesComponent` | `merchantGuard` | Galpões, setores, estantes e endereçamento físico. |
| **Auditoria de Estoque** | `/application/inventory-audit` | `InventoryAuditComponent` | `merchantGuard` | Contagens físicas ao vivo e ajuste de divergências. |
| **Itens e Materiais** | `/application/items`, `/materials` | `ItemsComponent`, `MaterialsComponent` | `merchantGuard` | Classificação taxonômica interna de insumos. |

---

## 2. Cadastro Mestre de Produtos (`ProductsComponent`, `ProductComponent`)
- **Ficha Cadastral do Produto**:
  - `pro_name` (*Texto*, obrigatório, mín: 3 caracteres): Nome comercial do produto.
  - `pro_sku` (*Alfanumérico*, obrigatório): Código identificador interno exclusivo.
  - `pro_barcode` (*Código de barras*, leitura por câmera/leitor): Código EAN/UPC padrão.
  - `pro_price` (*Decimal*, obrigatório): Preço unitário de venda.
  - `pro_description` (*Texto rico / Markdown*): Especificações técnicas do item.
  - `cat_uuid` (*Seletor hierárquico*): Categoria vinculada.
  - **Galeria de Imagens**: Upload múltiplo com arrastar-e-soltar e ordenação visual.
- **Ações e Atalhos**:
  - Busca inteligente por código SKU ou nome do item.
  - Alternador imediato de status `Ativo / Inativo` sem recarregar a tela.
  - Exclusão com proteção modal de dupla confirmação com `SweetAlert2`.

---

## 3. Matriz de Variações de Produto (`ProductVariationComponent`)
- **Gerador Automático de Combinações**:
  - Parâmetros configuráveis: Tamanho (`prov_size`), Cor (`prov_color`), Material (`prov_material`).
  - Geração imediata do produto cartesiano com todas as opções de variantes.
- **Parametrização Individual**:
  - Acréscimo ou desconto percentual/fixo sobre o valor base.
  - SKU e código de barras próprios para cada combinação.
  - Saldo de estoque individualizado por depósito via `InventoryStocksService`.

---

## 4. Topologia de Armazéns e Locações (`WarehousesComponent`)
- **Depósitos Físicos**: Gestão de centros de distribuição, lojas e depósitos auxiliares.
- **Endereçamento Logístico**:
  - Hierarquia: Corredor -> Estante -> Prateleira -> Gaveta (*Bin*).
  - Emissão de etiquetas com código de barras para identificação física nas prateleiras.
- **Integração com Leitor de Código de Barras (`BarcodeScannerComponent`)**:
  - Compatibilidade com leitores laser padrão USB/Bluetooth e reconhecimento via câmera do dispositivo (EAN-13, CODE-128, QR).

---

## 5. Auditoria de Inventário e Conciliação (`InventoryAuditComponent`)
- **Sessões de Auditoria**: Abertura de ciclos de contagem física por depósito ou setor.
- **Modo de Leitura Contínua**:
  - O operador realiza leituras sequenciais de código de barras; o sistema incrementa os totais com sinal sonoro de confirmação.
- **Painel Comparativo de Divergências**:
  - Confronto: `Estoque do Sistema` versus `Estoque Físico Apurado`.
  - Tags de status coloridas: `green` (Correto), `orange` (Sobra), `red` (Falta).
- **Consolidação Automática**: O botão `Consolidar Ajuste` lança os acertos no `StockMovementsService` com justificativa e rastreabilidade total do operador.
