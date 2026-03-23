import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzImageModule } from 'ng-zorro-antd/image';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { ProductVariationsService } from '@services/product-variations.service';

@Component({
  selector: 'app-price-list',
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzInputModule,
    NzIconModule,
    NzRadioModule,
    NzButtonModule,
    NzEmptyModule,
    NzTagModule,
    NzImageModule
  ],
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss'
})
export class PriceListComponent implements OnInit {
  paymentMethod: 'efectivo' | 'postnet' = 'efectivo'; // Por defecto: Efectivo
  private readonly RECARGO_POSTNET = 0.10; // 10%

  products: ProductVariationInterface[] = [];
  filteredProducts: ProductVariationInterface[] = [];
  filterText: string = '';

  expandedRows: { [key: string]: boolean } = {}; // Realiza el seguimiento de qué filas están abiertas

  constructor(private productService: ProductVariationsService) { }

  ngOnInit(): void {
    this.productService.getProductsVariations('28a0036e-2d6b-4e83-805a-1ca214a6b1e1', '').subscribe((products: any) => {
      this.products = [...products.data];
      this.filteredProducts = [...products.data];
    });
  }

  getFinalPrice(basePrice: number): number {
    if (this.paymentMethod === 'postnet') {
      return basePrice * (1 + this.RECARGO_POSTNET);
    }
    return basePrice;
  }

  toggleExpand(id: string): void {
    // Si ya está abierto, lo cierra. Si no existe o está cerrado, lo abre.
    this.expandedRows[id] = !this.expandedRows[id];
  }

  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  applyFilter(): void {
    const rawFilterValue = this.filterText.toLowerCase().trim();

    if (!rawFilterValue) {
      this.filteredProducts = [...this.products];
      return;
    }

    const normalizedFilterValue = this.removeAccents(rawFilterValue);

    this.filteredProducts = this.products.filter(product => {
      const normalizedProductName = this.removeAccents(product.prov_name.toLowerCase());
      return (
        normalizedProductName.includes(normalizedFilterValue) ||
        product.pro_uuid.toString().includes(rawFilterValue)
      );
    });
  }
}
