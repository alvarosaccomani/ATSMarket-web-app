import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductVariationInterface } from '@interfaces/product-variation';
import { CartService } from '@services/cart.service';
import { ProductsService } from '@services/products.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { CompaniesService } from '@services/companies.service';
import { GlobalItemsService } from '@services/global-items.service';
import { GlobalCategoriesService } from '@services/global-categories.service';

@Component({
  selector: 'app-catalog',
  imports: [
    CommonModule,
    FormsModule,
    NzLayoutModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzCheckboxModule,
    NzSliderModule,
    NzInputModule,
    NzDividerModule,
    NzDrawerModule,
    NzEmptyModule,
    NzPaginationModule,
    NzMessageModule,
    NzTagModule
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {

  public allProducts: ProductVariationInterface[] = [];
  public filteredProducts: ProductVariationInterface[] = [];
  public paginatedProducts: ProductVariationInterface[] = []; // Productos a renderizar en la página actual

  public searchTerm: string = '';
  
  private originalProducts: ProductVariationInterface[] = [];
  private searchSubject = new Subject<string>();
  
  // Opciones de rubros y categorías dinámicas
  public itemOptions: { label: string, value: string | null }[] = [{ label: 'Todos los Rubros', value: null }];
  public categoryOptions: { label: string, value: string | null }[] = [{ label: 'Todas las Categorías', value: null }];
  
  public selectedGlobalItem: string | null = null;
  public selectedCategory: string | null = null;
  
  public materialOptions = ['Resina', 'Madera', 'Plata 925', 'Metal', 'Otro'];
  public selectedMaterials: string[] = [];
  public priceRange: [number, number] = [0, 50000];
  public drawerVisible = false;

  // Variables de Paginación
  public currentPage: number = 1;
  public pageSize: number = 12;
  public pageSizeOptions: number[] = [12, 24, 48, 96];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private productService: ProductsService,
    private productVariationsService: ProductVariationsService,
    private companiesService: CompaniesService,
    private globalItemsService: GlobalItemsService,
    private globalCategoriesService: GlobalCategoriesService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { search: term || null },
        queryParamsHandling: 'merge'
      });
    });

    // 1. Verificar si ya existe un término de búsqueda en la URL
    const initialSearch = this.route.snapshot.queryParams['search'] || '';

    // 2. Determinar el observable de productos/variaciones inicial
    const products$ = initialSearch
      ? this.productVariationsService.searchVariations(initialSearch)
      : this.productVariationsService.searchVariations('');

    forkJoin({
      items: this.globalItemsService.getGlobalItems(),
      categories: this.globalCategoriesService.getGlobalCategories(),
      products: products$
    }).subscribe({
      next: (res: any) => {
        // 1. Cargar opciones de Rubros
        if (res.items && res.items.success) {
          this.itemOptions = [
            { label: 'Todos los Rubros', value: null },
            ...res.items.data.map((i: any) => ({ label: i.gitm_name, value: i.gitm_uuid }))
          ];
        }

        // 2. Cargar opciones de Categorías
        if (res.categories && res.categories.success) {
          this.categoryOptions = [
            { label: 'Todas las Categorías', value: null },
            ...res.categories.data.map((c: any) => ({ label: c.gcat_name, value: c.gcat_uuid }))
          ];
        }

        // 3. Mapear productos a variaciones de forma segura
        const rawData = res.products?.data || res.products || [];
        let variations: ProductVariationInterface[] = [];
        if (Array.isArray(rawData)) {
          if (rawData.length > 0 && ('productVariations' in rawData[0] || 'itm_uuid' in rawData[0])) {
            rawData.forEach((prod: any) => {
              if (prod.productVariations && Array.isArray(prod.productVariations)) {
                prod.productVariations.forEach((v: any) => {
                  variations.push({
                    ...v,
                    cat_uuid: prod.cat_uuid,
                    itm_uuid: prod.itm_uuid,
                    pro_name: prod.pro_name
                  });
                });
              }
            });
          } else {
            variations = rawData;
          }
        }
        this.allProducts = variations;

        // Solo guardamos originalProducts si no venía un término inicial de búsqueda
        if (!initialSearch) {
          this.originalProducts = variations;
        }

        // Ajustar rango de precios dinámico
        if (this.allProducts.length > 0) {
          const precios = this.allProducts.map(p => p.prov_suggestedminimumsellingprice);
          const min = Math.min(...precios);
          const max = Math.max(...precios);
          this.priceRange = [Math.floor(min), Math.ceil(max) > 0 ? Math.ceil(max) : 50000];
        }

        // 4. Leer parámetros de la URL para inicializar filtros
        this.route.queryParams.subscribe(params => {
          this.searchTerm = params['search'] || '';
          this.selectedCategory = params['category'] || null;
          this.selectedGlobalItem = params['item'] || null;
          this.executeSearch();
        });
      },
      error: (err) => {
        console.error('Error cargando catálogo:', err);
        this.message.error('Ocurrió un error al cargar el catálogo de productos.');
      }
    });
  }

  public onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  public executeSearch(): void {
    if (this.searchTerm) {
      this.productVariationsService.searchVariations(this.searchTerm).subscribe({
        next: (res: any) => {
          this.allProducts = res.data || [];
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error buscando variaciones:', err);
          this.allProducts = [];
          this.applyFilters();
        }
      });
    } else {
      if (this.originalProducts.length === 0) {
        // Carga diferida (lazy load) del catálogo completo si no se cargó al inicio
        this.productVariationsService.searchVariations('').subscribe({
          next: (res: any) => {
            this.originalProducts = res.data || res || [];
            this.allProducts = this.originalProducts;
            this.applyFilters();
          },
          error: (err) => {
            console.error('Error cargando catálogo original:', err);
          }
        });
      } else {
        this.allProducts = this.originalProducts;
        this.applyFilters();
      }
    }
  }

  public applyFilters(): void {
    let result = this.allProducts;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.prov_name.toLowerCase().includes(term) ||
        p?.prov_sku?.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      result = result.filter(p => (p as any).cat_uuid === this.selectedCategory);
    }

    if (this.selectedGlobalItem) {
      result = result.filter(p => (p as any).itm_uuid === this.selectedGlobalItem);
    }

    if (this.selectedMaterials.length > 0) {
      // result = result.filter(p => this.selectedMaterials.includes(p.material));
    }

    // Filtrar por rango
    result = result.filter(p => p.prov_suggestedminimumsellingprice >= this.priceRange[0] && p.prov_suggestedminimumsellingprice <= this.priceRange[1]);

    this.filteredProducts = result;
    this.currentPage = 1; // Resetear siempre a la primera página al filtrar
    this.updatePagination();
  }

  // --- MÉTODOS DE PAGINACIÓN ---
  public updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al cambiar página opcionalmente
  }

  public onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  public agregarAlCarrito(producto: ProductVariationInterface): void {
    this.cartService.addToCart(producto, 1);
  }

  public openDrawer(): void {
    this.drawerVisible = true;
  }

  public closeDrawer(): void {
    this.drawerVisible = false;
    this.applyFilters();
  }

  // --- MÉTODOS PARA DETALLE DE PRODUCTO ---

  public openProductDetail(producto: ProductVariationInterface): void {
    // Buscar la compañía por ID para obtener su slug e ir a la ruta contextual
    this.companiesService.getCompanyById(producto.cmp_uuid).subscribe({
      next: (res: any) => {
        const company = res?.data;
        const slug = company?.cmp_slug || 'catalog';
        this.router.navigate(['/public/store-catalog', slug, 'product', producto.prov_uuid]);
      },
      error: () => {
        // Fallback si falla la llamada
        this.router.navigate(['/public/store-catalog', 'catalog', 'product', producto.prov_uuid]);
      }
    });
  }
}
