import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RouterLink, Router } from '@angular/router';

// NG-ZORRO
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

// SERVICIOS Y MODELOS
import { CompaniesService } from '@services/companies.service';
import { ProductsService } from '@services/products.service';
import { StoreContextService } from '@services/store-context.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { CompanyInterface } from '@interfaces/company';
import { GlobalItemInterface } from '@interfaces/global-item';
import { GlobalItemsService } from '@services/global-items.service';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { ProductVariationInterface } from '@interfaces/product-variation';
import { GlobalCategoryInterface } from '@interfaces/global-category';

@Component({
  selector: 'app-market-home',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzGridModule,
    NzCardModule,
    NzCarouselModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzAvatarModule,
    NzTypographyModule
  ],
  templateUrl: './market-home.component.html',
  styleUrl: './market-home.component.scss'
})
export class MarketHomeComponent implements OnInit {

  public isLoadingFeaturedStores: boolean = true;
  public featuredStores: CompanyInterface[] = [];
  public productosGlobales: ProductVariationInterface[] = [];

  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

  // Filtros a nivel SISTEMA
  public searchGlobal: string = '';
  public itemSelected: string | null = null;
  public categorySelected: string | null = null;

  public isLoadingGlobalItems: boolean = true;
  public globalItems: GlobalItemInterface[] = [];

  public isLoadingGlobalCategories: boolean = true;
  public globalCategories: GlobalCategoryInterface[] = [];

  constructor(
    private _globalItemsService: GlobalItemsService,
    private _globalCategoriesService: GlobalCategoriesService,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    private productVariationsService: ProductVariationsService,
    private storeContext: StoreContextService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Limpiar tienda activa al volver al home del marketplace
    this.storeContext.clearStore();

    this.getGlobalItems();
    this.getGlobalCategories();

    // 1. Cargar tiendas destacadas
    this.getFeaturedCompanies();

    // 2. Cargar productos tendencia reales de todo el sistema
    this.productVariationsService.searchVariations('').subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // Tomar los primeros 8 productos tendencia
          this.productosGlobales = res.data.slice(0, 8);
        }
      },
      error: (err) => {
        console.error('Error cargando productos tendencia:', err);
      }
    });
  }

  // Al buscar globalmente, redirigimos al catálogo general
  public onGlobalSearch(): void {
    const queryParams: any = {};
    if (this.searchGlobal.trim()) {
      queryParams.search = this.searchGlobal.trim();
    }
    if (this.itemSelected && this.itemSelected !== '0') {
      queryParams.item = this.itemSelected;
    }
    this.router.navigate(['/public/catalog'], { queryParams });
  }

  public filterByCategory(gcat_uuid: string) {
    this.router.navigate(['/public/catalog'], { queryParams: { category: gcat_uuid } });
  }

  private getGlobalItems(): void {
    this._globalItemsService.getGlobalItems()
      .pipe(
        finalize(() => this.isLoadingGlobalItems = false) // Se ejecuta siempre al terminar
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            let globalItems = response.data;
            globalItems.unshift({ gitm_name: 'Todas los Rubros', gitm_uuid: '0' });
            this.globalItems = globalItems;
            this.itemSelected = globalItems[0].gitm_uuid;
          }
        },
        error: (err) => {
          console.error('Error cargando empresas:', err);
        }
      });
  }

  private getGlobalCategories(): void {
    this._globalCategoriesService.getGlobalCategories()
      .pipe(
        finalize(() => this.isLoadingGlobalCategories = false) // Se ejecuta siempre al terminar
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            let globalCategories = response.data;
            globalCategories.unshift({ gcat_name: 'Todas las Categorías', gcat_uuid: '0' });
            this.globalCategories = globalCategories;
            this.categorySelected = globalCategories[0].gcat_uuid;
          }
        },
        error: (err) => {
          console.error('Error cargando empresas:', err);
        }
      });
  }

  private getFeaturedCompanies(): void {
    this.companiesService.getFeaturedCompanies()
      .pipe(
        finalize(() => this.isLoadingFeaturedStores = false) // Se ejecuta siempre al terminar
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.featuredStores = response.data;
          }
        },
        error: (err) => {
          console.error('Error cargando empresas:', err);
        }
      });
  }

  public goToStore(slug: string): void {
    this.router.navigate(['/public/home-store', slug]);
  }

  public openProductDetail(producto: ProductVariationInterface): void {
    // Buscar la compañía por ID para obtener su slug e ir a la ruta contextual del catálogo
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

  public scrollCarousel(direction: number): void {
    if (this.carouselTrack) {
      const track = this.carouselTrack.nativeElement;
      const scrollAmount = track.clientWidth * 0.8; // Desplazar el 80% del ancho visible
      
      const currentScroll = track.scrollLeft;
      const maxScroll = track.scrollWidth - track.clientWidth;

      // Si se desplaza a la derecha y está en el extremo final, vuelve al inicio
      if (direction === 1 && currentScroll >= maxScroll - 10) {
        track.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
      // Si se desplaza a la izquierda y está en el extremo inicial, va al final
      else if (direction === -1 && currentScroll <= 10) {
        track.scrollTo({
          left: maxScroll,
          behavior: 'smooth'
        });
      }
      // Desplazamiento estándar intermedio
      else {
        track.scrollBy({
          left: direction * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }

}
