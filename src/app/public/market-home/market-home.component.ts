import { Component, OnInit } from '@angular/core';
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
import { CompanyInterface } from '@interfaces/company';
import { GlobalItemInterface } from '@interfaces/global-item';
import { GlobalItemsService } from '@services/global-items.service';
import { ProductVariationInterface } from '@interfaces/product-variation';

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
export class MarketHomeComponent {

  public isLoadingFeaturedStores: boolean = true;
  public featuredStores: CompanyInterface[] = [];
  public productosGlobales: ProductVariationInterface[] = [];

  // Filtros a nivel SISTEMA
  public searchGlobal: string = '';
  public itemSelected: string | null = null;

  public isLoadingGlobalItems: boolean = true;
  public globalItems: GlobalItemInterface[] = [];

  constructor(
    private _globalItemsService: GlobalItemsService,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.getGlobalItems();
    // 1. Cargar tiendas destacadas
    this.getFeaturedCompanies();

    // 2. Cargar productos más vendidos de todo el sistema
    this.productsService.getFeaturedProducts(8).subscribe((prods: any) => {
      this.productosGlobales = prods.data;
    });
  }

  // Al buscar globalmente, podríamos redirigir a un buscador general
  public onGlobalSearch(): void {
    console.log('Buscando en todo el Marketplace:', this.searchGlobal);
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
            globalItems.unshift({ gitm_name: 'Todas los Rubros', gitm_uuid: null });
            this.globalItems = globalItems;
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
    this.router.navigate(['/public/store', slug]);
  }

}
