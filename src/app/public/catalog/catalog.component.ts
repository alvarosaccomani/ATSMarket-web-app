import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

import { ProductVariationInterface } from '@interfaces/product-variation';
import { CartService } from '@services/cart.service';
import { ProductsService } from '@services/products.service';
import { CompaniesService } from '@services/companies.service';

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
  public selectedCategory: string | null = null;
  public materialOptions = ['Resina', 'Madera', 'Plata 925', 'Metal', 'Otro'];
  public selectedMaterials: string[] = [];
  public priceRange: [number, number] = [0, 50000];
  public drawerVisible = false;

  // Variables de Paginación
  public currentPage: number = 1;
  public pageSize: number = 12;
  public pageSizeOptions: number[] = [12, 24, 48, 96];

  public categoryOptions = [
    { label: 'Todos', value: null },
    { label: 'Estatuas & Figuras', value: 'estatuas' },
    { label: 'Rosarios de Autor', value: 'rosarios' },
    { label: 'Medallas y Relicarios', value: 'medallas' },
    { label: 'Otros Artículos', value: 'otros' }
  ];

  constructor(
    private router: Router,
    private cartService: CartService,
    private productService: ProductsService,
    private companiesService: CompaniesService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // Simulación temporal.
    this.productService.getProducts('').subscribe((products: any) => {
      this.allProducts = products;
      // Ajustar rango inicial inteligente basado en los productos disponibles
      if (this.allProducts.length > 0) {
        const precios = this.allProducts.map(p => p.prov_suggestedminimumsellingprice);
        const min = Math.min(...precios);
        const max = Math.max(...precios);
        this.priceRange = [Math.floor(min), Math.ceil(max) > 0 ? Math.ceil(max) : 50000];
      }
      this.applyFilters();
    });
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
      // result = result.filter(p => p.categoria === this.selectedCategory);
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
