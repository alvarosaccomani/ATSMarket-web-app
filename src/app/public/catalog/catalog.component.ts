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
