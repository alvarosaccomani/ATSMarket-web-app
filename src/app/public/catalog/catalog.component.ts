import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ProductInterface } from '@interfaces/product.interface';
import { CartService } from '@services/cart.service';
import { ProductsService } from '@services/products.service';

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
    NzDrawerModule
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {

  // Listas de productos
  public allProducts: ProductInterface[] = []; // Todos los productos cargados
  public filteredProducts: ProductInterface[] = []; // Productos que se muestran en la grilla

  // Modelos para los filtros
  public searchTerm: string = '';
  public selectedCategory: string | null = null;
  public materialOptions = ['Resina', 'Madera', 'Plata 925', 'Metal', 'Otro'];
  public selectedMaterials: string[] = [];
  public priceRange: [number, number] = [0, 50000]; // Rango inicial de precios
  public drawerVisible = false;

  // Opciones para el select de Categorías
  public categoryOptions = [
    { label: 'Todos', value: null },
    { label: 'Estatuas & Figuras', value: 'estatuas' },
    { label: 'Rosarios de Autor', value: 'rosarios' },
    { label: 'Medallas y Relicarios', value: 'medallas' },
    { label: 'Otros Artículos', value: 'otros' }
  ];

  constructor(
    private cartService: CartService,
    private productService: ProductsService // Asume la inyección de este servicio
  ) { }

  ngOnInit(): void {
    // Simulación de carga (reemplazar por llamada a this.productService.getAll())
    this.productService.getAllProducts().subscribe(products => {
      this.allProducts = products;
      // Ajustar rango de precio inicial
      const precios = this.allProducts.map(p => p.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      this.priceRange = [min, max];
      this.applyFilters();
    });
  }

  // --- MÉTODOS DE FILTRADO ---

  public applyFilters(): void {
    let result = this.allProducts;

    // 1. Filtrar por búsqueda de texto
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p?.referencia?.toLowerCase().includes(term)
      );
    }

    // 2. Filtrar por categoría
    if (this.selectedCategory) {
      result = result.filter(p => p.categoria === this.selectedCategory);
    }

    // 3. Filtrar por material
    if (this.selectedMaterials.length > 0) {
      //result = result.filter(p => this.selectedMaterials.includes(p.material));
    }

    // 4. Filtrar por rango de precio
    result = result.filter(p => p.precio >= this.priceRange[0] && p.precio <= this.priceRange[1]);

    this.filteredProducts = result;
  }

  // --- MÉTODOS DE ACCIÓN ---

  public consultarPrecio(producto: ProductInterface): void {
    // Lógica para mostrar el precio (Modal o Notificación)
    alert(`El precio de "${producto.nombre}" es $${producto.precio}.`);
  }

  public agregarAlCarrito(producto: ProductInterface): void {
    this.cartService.addToCart(producto, 1);
    // TODO: Usar NzMessage para notificar al usuario
  }

  // Método para abrir el drawer (desde el botón en móvil)
  public openDrawer(): void {
    this.drawerVisible = true;
  }

  // Método para cerrar el drawer
  public closeDrawer(): void {
    this.drawerVisible = false;
    // Llamar a applyFilters() aquí asegura que los filtros se apliquen al cerrar
    this.applyFilters();
  }
}
