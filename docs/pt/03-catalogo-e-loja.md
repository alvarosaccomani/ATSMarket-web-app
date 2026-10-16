# 03. Catálogo Público e Exploração de Lojas

## 1. Escopo Funcional e Rotas
O módulo público oferece a experiência de vitrine digital, permitindo aos clientes descobrir lojas, filtrar catálogos por segmento ou material e consultar especificações técnicas de produtos e variantes.

| Tela | Rota | Componente | Descrição |
| :--- | :--- | :--- | :--- |
| **Página Inicial do Mercado** | `/public/market-home` | `MarketHomeComponent` | Carrossel promocional, categorias e estabelecimentos em destaque. |
| **Explorador de Categorias** | `/public/categories-list` | `CategoriesListComponent` | Estrutura taxonômica completa de categorias globais. |
| **Perfil da Loja** | `/public/home-store/:slug` | `HomeStoreComponent` | Apresentação institucional da loja, dados cadastrais e filiais. |
| **Catálogo da Loja** | `/public/store-catalog/:slug` | `StoreCatalogComponent` | Catálogo de produtos exclusivo do estabelecimento com filtros. |
| **Catálogo Global** | `/public/catalog` | `CatalogComponent` | Busca transversal com painel lateral de filtros avançados. |
| **Detalhe do Produto** | `/public/store-catalog/:slug/product/:pro_uuid` | `ProductDetailComponent` | Galeria de imagens, seleção de variações, estoque e avaliações. |

---

## 2. Componentes de Interface e Ações do Usuário

### Página Inicial e Catálogo Global (`MarketHomeComponent`, `CatalogComponent`)
- **Busca Reativa (`searchTerm`)**: Campo de texto com temporizador (*debounce*) para disparar buscas otimizadas sem recarregar a tela.
- **Painel Lateral de Filtros (`nz-drawer`)**:
  - Acionador: Botão `Filtrar Catálogo` com ícone `filter`.
  - **Categorias Globais**: Seletor suspenso `nz-select` com busca automática para limitar o setor.
  - **Materiais**: Lista de caixas de seleção (`nz-checkbox`) para filtragem por matéria-prima (madeira, metal, tecido, etc.).
  - **Faixa de Preço**: Campos para valor mínimo e máximo.
  - Botão de ação: `Cerrar / Aplicar`.
- **Diretiva de Pré-carregamento (`ImagePreloadDirective`)**: Garante exibição de imagem neutra (*placeholder*) em conexões lentas ou links indisponíveis.

### Ficha Técnica do Produto (`ProductDetailComponent`)
- **Galeria de Fotos**: Carrossel com ampliação em alta definição e miniaturas selecionáveis.
- **Seletor de Variações**: Controles dinâmicos de atributos (tamanhos, cores, materiais) integrados com `ProductVariationsService`. Ao alternar a variante:
  - O código SKU é atualizado.
  - O preço e o saldo de estoque são recalculados em tempo real.
  - Badge visual de status: `green` (Disponível), `orange` (Últimas unidades), `red` (Esgotado).
- **Controle de Quantidade**: Botoeira incremental (`+` / `-`) respeitando o limite físico disponível em estoque.
- **Botão `Agregar al Carrito`**: Botão primário com sinalização sonora/visual e emissão de evento reativo para o `CartService`.
- **Módulo de Avaliações**: Nota média em estrelas (`nz-rate`) e lista de opiniões verificadas de clientes.
