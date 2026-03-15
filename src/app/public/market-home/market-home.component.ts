import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  public tiendasDestacadas: CompanyInterface[] = [];
  public productosGlobales: ProductVariationInterface[] = [];

  // Filtros a nivel SISTEMA
  public searchGlobal: string = '';
  public categoriaSistema: string | null = null;

  public categoriasGlobales: any[] = [
    { label: 'Todas las Tiendas', value: null },
    { label: 'Santería Tradicional', value: 'santeria' },
    { label: 'Libros y Oraciones', value: 'libros' },
    { label: 'Arte Sacro', value: 'arte' }
  ];

  constructor(
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Cargar todas las tiendas para el directorio
    this.companiesService.getFeaturedCompanies().subscribe((stores: any) => {
      this.tiendasDestacadas = stores;
    });

    // 2. Cargar productos más vendidos de todo el sistema
    this.productsService.getFeaturedProducts(8).subscribe((prods: any) => {
      this.productosGlobales = prods.data;
    });
  }

  // Al buscar globalmente, podríamos redirigir a un buscador general
  public onGlobalSearch(): void {
    console.log('Buscando en todo el Marketplace:', this.searchGlobal);
  }

  public irATienda(slug: string): void {
    this.router.navigate(['/', slug]);
  }

}
