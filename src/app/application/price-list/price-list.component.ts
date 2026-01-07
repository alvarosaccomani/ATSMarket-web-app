import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductInterface } from '@interfaces/product.interface';
import { ProductsService } from '@services/products.service';

@Component({
  selector: 'app-price-list',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss'
})
export class PriceListComponent implements OnInit {
  // 💡 NUEVOS ATRIBUTOS para el manejo de pagos
  paymentMethod: 'efectivo' | 'postnet' = 'efectivo'; // Por defecto: Efectivo
  private readonly RECARGO_POSTNET = 0.10; // 10%

  products: ProductInterface[] = [];

  filteredProducts: ProductInterface[] = [];
  filterText: string = '';

  constructor(
    private productService: ProductsService
  ) { }

  ngOnInit(): void {
    this.productService.getAllProducts('').subscribe(products => {
      this.products = [...products];
      this.filteredProducts = [...products];
    });
  }

  // 💡 NUEVO MÉTODO: Calcula el precio final basado en el método de pago seleccionado.
  getFinalPrice(basePrice: number): number {
    if (this.paymentMethod === 'postnet') {
      // Precio + 10% de recargo
      return basePrice * (1 + this.RECARGO_POSTNET);
    }
    // Si es 'efectivo', devuelve el precio base
    return basePrice;
  }

  /**
   * 💡 Función Auxiliar para eliminar acentos.
   * Utiliza la normalización Unicode (NFD) para separar el carácter base del acento.
   */
  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // 5. Función de filtrado
  applyFilter(): void {
    const rawFilterValue = this.filterText.toLowerCase().trim();

    if (!rawFilterValue) {
      this.filteredProducts = [...this.products];
      return;
    }

    // 1. Normalizar el valor de búsqueda (el input del usuario)
    const normalizedFilterValue = this.removeAccents(rawFilterValue);

    this.filteredProducts = this.products.filter(product => {
      // 2. Normalizar el nombre del producto para la comparación
      const normalizedProductName = this.removeAccents(product.nombre.toLowerCase());

      return (
        // Búsqueda en Nombre (Normalizado)
        normalizedProductName.includes(normalizedFilterValue) ||
        // Búsqueda en ID (sin normalización, ya que es un número)
        product.id.toString().includes(rawFilterValue)
      );
    });
  }
}
