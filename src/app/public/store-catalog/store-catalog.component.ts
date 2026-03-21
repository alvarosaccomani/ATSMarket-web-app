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

// DIRECTIVAS
import { ImagePreloadDirective } from '@directives/image-preload.directive';

// SERVICIOS Y MODELOS
import { ProductVariationInterface } from '@interfaces/product-variation';
import { CompanyInterface } from '@interfaces/company';
import { CartService } from '@services/cart.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { CompaniesService } from '@services/companies.service';

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

  // Modelos de Filtro
  public searchTerm: string = '';
  public selectedCategory: string | null = null;
  public materialOptions = ['Resina', 'Madera', 'Plata 925', 'Metal', 'Otro']; // Ejemplo
  public selectedMaterials: string[] = [];
  public priceRange: [number, number] = [0, 50000];
  public drawerVisible: boolean = false;

  public categoryOptions = [
    { label: 'Todos', value: null },
    { label: 'Estatuas & Figuras', value: 'estatuas' },
    { label: 'Rosarios de Autor', value: 'rosarios' },
    { label: 'Medallas y Relicarios', value: 'medallas' },
    { label: 'Otros Artículos', value: 'otros' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companiesService: CompaniesService,
    private productsVariationsService: ProductVariationsService,
    private cartService: CartService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const slug = params.get('slug');
        if (!slug) return of(null);
        this.companieslug = slug;
        return this.companiesService.getCompanyBySlug(slug);
      }),
      switchMap((store: any) => {
        if (store && store.data) {
          this.store = store.data;
        }

        if (!store) {
          this.message.error('Tienda no encontrada o URL incorrecta.');
          this.router.navigate(['/']);
          return of([]);
        }

        // Mock ID for API Request
        return this.productsVariationsService.getProductsVariations('28a0036e-2d6b-4e83-805a-1ca214a6b1e1', '', this.companieslug);
      })
    ).subscribe((products: any) => {
      this.allStoreProducts = products.data || [];
      this.initializeFilters(this.allStoreProducts);
      this.applyFilters();
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
      // result = result.filter(p => p.categoria === this.selectedCategory);
    }

    if (this.selectedMaterials.length > 0) {
      // result = result.filter(p => this.selectedMaterials.includes(p.material));
    }

    result = result.filter(p => p.prov_suggestedminimumsellingprice >= this.priceRange[0] && p.prov_suggestedminimumsellingprice <= this.priceRange[1]);

    this.filteredProducts = result;
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
}
