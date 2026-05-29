import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
import { GlobalCategoriesService } from '@services/global-categories.service';
import { GlobalMaterialsService } from '@services/global-materials.service';

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

    // Suscribirse a la tienda activa
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

  // --- MÉTODOS PARA DETALLE DE PRODUCTO Y RESEÑAS ---

  public getProductAverageRating(prov_uuid: string): number {
    const stored = localStorage.getItem(`ats_reviews_${prov_uuid}`);
    let localReviews: any[] = [];
    if (stored) {
      try {
        localReviews = JSON.parse(stored);
      } catch (e) {}
    }
    const seedReviews = this.generateSeedReviews(prov_uuid);
    const allReviews = [...localReviews, ...seedReviews];
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / allReviews.length).toFixed(1));
  }

  public getProductReviewsCount(prov_uuid: string): number {
    const stored = localStorage.getItem(`ats_reviews_${prov_uuid}`);
    let localReviews: any[] = [];
    if (stored) {
      try {
        localReviews = JSON.parse(stored);
      } catch (e) {}
    }
    const seedReviews = this.generateSeedReviews(prov_uuid);
    return localReviews.length + seedReviews.length;
  }

  public openProductDetail(producto: ProductVariationInterface): void {
    this.router.navigate(['/public/store-catalog', this.companieslug, 'product', producto.prov_uuid]);
  }

  private generateSeedReviews(prov_uuid: string): any[] {
    const seed = prov_uuid.charCodeAt(0) % 4;
    const date1 = new Date();
    date1.setDate(date1.getDate() - 3);
    const date2 = new Date();
    date2.setDate(date2.getDate() - 12);
    const date3 = new Date();
    date3.setDate(date3.getDate() - 28);

    const fallbacks = [
      [
        {
          author: 'Martín S.',
          avatar: 'MS',
          rating: 5,
          comment: 'La calidad del artículo es excelente, el material se siente super premium y la terminación es impecable. El envío me llegó al día siguiente por moto.',
          date: date1.toISOString(),
          verified: true
        },
        {
          author: 'Clara G.',
          avatar: 'CG',
          rating: 4,
          comment: 'Muy lindo producto. Corresponde exactamente a las fotos y la descripción técnica. Muy conforme con la compra.',
          date: date2.toISOString(),
          verified: true
        }
      ],
      [
        {
          author: 'Roberto F.',
          avatar: 'RF',
          rating: 5,
          comment: '¡Espectacular! Se nota que cuidan cada detalle en la fabricación. Ya lo recomendé a mis familiares y volveré a comprar seguro.',
          date: date1.toISOString(),
          verified: true
        },
        {
          author: 'Sofía M.',
          avatar: 'SM',
          rating: 3,
          comment: 'El producto está bien, pero demoró un poco el correo postal en entregarlo. Por lo demás, excelente trato del vendedor.',
          date: date3.toISOString(),
          verified: false
        }
      ],
      [
        {
          author: 'Gabriela L.',
          avatar: 'GL',
          rating: 5,
          comment: 'Totalmente recomendado. Llegó muy bien embalado y el diseño superó mis expectativas. Muchas gracias por la rapidez de respuesta.',
          date: date2.toISOString(),
          verified: true
        }
      ],
      [
        {
          author: 'Esteban D.',
          avatar: 'ED',
          rating: 4,
          comment: 'Muy buena relación calidad-precio. Cumple perfectamente con lo prometido y los detalles grabados son muy finos.',
          date: date3.toISOString(),
          verified: true
        }
      ]
    ];

    return fallbacks[seed] || fallbacks[0];
  }
}
