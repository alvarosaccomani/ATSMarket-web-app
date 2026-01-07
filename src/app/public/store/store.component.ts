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

// SERVICIOS Y MODELOS
import { ProductInterface } from '@interfaces/product.interface';
import { StoreInterface } from '@interfaces/store.interface';
import { CartService } from '@services/cart.service';
import { ProductsService } from '@services/products.service';
import { StoresService } from '@services/stores.service';

@Component({
  selector: 'app-store',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    // NG-ZORRO
    NzLayoutModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzCheckboxModule,
    NzSliderModule,
    NzInputModule,
    NzDividerModule
  ],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent {

  public store: StoreInterface | null = null;
  public storeSlug: string = '';

  public allStoreProducts: ProductInterface[] = [];
  public filteredProducts: ProductInterface[] = [];

  // Modelos de Filtro
  public searchTerm: string = '';
  public selectedCategory: string | null = null;
  public selectedMaterials: string[] = [];
  public priceRange: [number, number] = [0, 50000];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storesService: StoresService,
    private productsService: ProductsService,
    private cartService: CartService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // Escucha los cambios en el parámetro de la URL (:slug)
    this.route.paramMap.pipe(
      // 1. Obtiene el slug de la URL
      switchMap((params: ParamMap) => {
        const slug = params.get('slug');
        if (!slug) return of(null);
        this.storeSlug = slug;
        return this.storesService.getStoreBySlug(slug); // Busca la información de la tienda
      }),
      // 2. Cuando tiene la tienda, busca sus productos
      switchMap((store) => {
        this.store = store;
        if (!store) {
          this.message.error('Tienda no encontrada o URL incorrecta.');
          this.router.navigate(['/']); // Redirige al Home Global si no existe
          return of([]);
        }
        // Llamada al ProductService, filtrando por el slug de la tienda
        return this.productsService.getAllProducts(this.storeSlug);
      })
    ).subscribe(products => {
      this.allStoreProducts = products;
      this.initializeFilters(products);
      this.applyFilters();
    });
  }

  // Inicializa los rangos de precio y materiales disponibles
  public initializeFilters(products: ProductInterface[]): void {
    if (products.length > 0) {
      const precios = products.map(p => p.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      this.priceRange = [min, max];
    } else {
      this.priceRange = [0, 50000];
    }
  }

  public applyFilters(): void {
    // Lógica de filtrado idéntica a CatalogoComponent, pero usando allStoreProducts
    let result = this.allStoreProducts;

    // ... (Implementar aquí la lógica de filtrado por searchTerm, selectedCategory, selectedMaterials, priceRange) ...

    this.filteredProducts = result;
  }

  public agregarAlCarrito(producto: ProductInterface): void {
    this.cartService.addToCart(producto, 1);
    this.message.success(`${producto.nombre} agregado al carrito.`);
  }

  public consultarPrecio(producto: ProductInterface): void {
    alert(`El precio de ${producto.nombre} de ${this.store?.nombre} es $${producto.precio}.`);
  }

}
