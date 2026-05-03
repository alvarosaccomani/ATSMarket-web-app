import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

// DIRECTIVAS
import { ImagePreloadDirective } from '@directives/image-preload.directive';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { CompanyInterface } from '@interfaces/company';
import { CartService } from '@services/cart.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { StoreContextService } from '@services/store-context.service';
import { CompanySettingInterface } from '@interfaces/company-setting';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { GlobalMaterialsService } from '@services/global-materials.service';
import { GlobalMaterialInterface } from '@interfaces/global-material';
import { GlobalItemInterface } from '@interfaces/global-item';

@Component({
  selector: 'app-store',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
    NzTagModule,
    NzPaginationModule,
    ImagePreloadDirective
  ],
  templateUrl: './store-catalog.component.html',
  styleUrl: './store-catalog.component.scss'
})
export class StoreCatalogComponent implements OnInit {

  public store: CompanyInterface | null = null;
  public companieslug: string = '';

  public allStoreProducts: ProductVariationInterface[] = [];
  public filteredProducts: ProductVariationInterface[] = [];
  public paginatedProducts: ProductVariationInterface[] = [];

  // Modelos de Filtro
  public searchTerm: string = '';
  public selectedCategory: string | null = null;
  public materialOptions: { label: string, value: string, checked: boolean }[] = [];
  public priceRange: [number, number] = [0, 50000];
  public drawerVisible: boolean = false;

  // Variables de Paginación
  public currentPage: number = 1;
  public pageSize: number = 12;
  public pageSizeOptions: number[] = [12, 24, 48, 96];

  public categoryOptions: { label: string, value: string | null }[] = [
    { label: 'Todos', value: null }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _storeContext: StoreContextService,
    private productsVariationsService: ProductVariationsService,
    private cartService: CartService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _globalMaterialsService: GlobalMaterialsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // Escuchar el slug de la URL
    this.route.paramMap.subscribe(params => {
      this.companieslug = params.get('slug') || '';
    });

    // Suscribirse a la tienda activa (ya detectada por el Layout)
    this._storeContext.activeStore$.subscribe(store => {
      if (store) {
        this.store = store;
        this.loadProducts(store.cmp_uuid);
      }
    });

    // Suscribirse a las configuraciones
    this._storeContext.storeSettings$.subscribe(settings => {
      // Si necesitamos hacer algo específico con los settings aquí
    });

    this.loadGlobalFilters();
  }

  private loadGlobalFilters(): void {
    // Cargar Categorías
    this._globalCategoriesService.getGlobalCategories().subscribe(res => {
      const categories = res.data.map(i => ({ label: i.gcat_name, value: i.gcat_uuid }));
      this.categoryOptions = [{ label: 'Todos', value: null }, ...categories];
    });

    // Cargar Materiales
    this._globalMaterialsService.getGlobalMaterials().subscribe(res => {
      this.materialOptions = res.data.map(m => ({
        label: m.gmat_name,
        value: m.gmat_uuid,
        checked: false
      }));
    });
  }

  private loadProducts(cmp_uuid: string): void {
    if (!cmp_uuid) return;

    this.productsVariationsService.getProductsVariations(cmp_uuid, '', this.companieslug)
      .subscribe((products: any) => {
        this.allStoreProducts = products.data || [];
        this.initializeFilters(this.allStoreProducts);
        this.applyFilters();
      }, (error: any) => {
        console.error('Error al cargar productos:', error);
      });
  }

  public initializeFilters(products: ProductVariationInterface[]): void {
    if (products.length > 0) {
      const precios = products.map(p => p.prov_suggestedminimumsellingprice);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      this.priceRange = [Math.floor(min), Math.ceil(max) > 0 ? Math.ceil(max) : 50000];
    } else {
      this.priceRange = [0, 50000];
    }
  }

  public applyFilters(): void {
    let result = this.allStoreProducts;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.prov_name.toLowerCase().includes(term) ||
        p?.prov_sku?.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      result = result.filter((p: any) => p.itm_uuid === this.selectedCategory);
    }

    const selectedMaterialIds = this.materialOptions
      .filter(m => m.checked)
      .map(m => m.value);

    if (selectedMaterialIds.length > 0) {
      result = result.filter((p: any) => selectedMaterialIds.includes(p.gmat_uuid));
    }

    result = result.filter(p => p.prov_suggestedminimumsellingprice >= this.priceRange[0] && p.prov_suggestedminimumsellingprice <= this.priceRange[1]);

    this.filteredProducts = result;
    this.currentPage = 1;
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al cambiar página
  }

  public onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  public agregarAlCarrito(producto: ProductVariationInterface): void {
    this.cartService.addToCart(producto, 1);
    this.message.success(`${producto.prov_name} agregado al carrito.`);
  }

  public openDrawer(): void {
    this.drawerVisible = true;
  }

  public closeDrawer(): void {
    this.drawerVisible = false;
    this.applyFilters();
  }

  public getSetting(key: string, defaultValue: any): any {
    return this._storeContext.getSetting(key, defaultValue);
  }
}
