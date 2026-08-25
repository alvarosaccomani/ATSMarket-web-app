import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { ProductVariationsService } from '@services/product-variations.service';
import { SessionService } from '@services/session.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-products-variations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    NzToolTipModule,
    NzCardModule,
    NzInputModule,
    NzAvatarModule,
    NzSpinModule,
    NzSelectModule
  ],
  templateUrl: './products-variations.component.html',
  styleUrl: './products-variations.component.scss'
})
export class ProductsVariationsComponent implements OnInit {

  public activeCompanyUuid: string = '';
  public variations: ProductVariationInterface[] = [];
  public filteredVariations: ProductVariationInterface[] = [];
  public isFetching: boolean = true;

  public searchTerm: string = '';
  public stockStatus: 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' = 'ALL';
  public pageIndex: number = 1;
  public pageSize: number = 20;

  constructor(
    private _router: Router,
    private _sessionService: SessionService,
    private _productVariationsService: ProductVariationsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.activeCompanyUuid = company.cmp_uuid;
      this.loadVariations();
    } else {
      this.isFetching = false;
      this._messageService.error('Error', 'No se encontró una tienda activa en la sesión.');
    }
  }

  public loadVariations(): void {
    this.isFetching = true;
    this._productVariationsService.getProductsVariations(this.activeCompanyUuid, '')
      .subscribe({
        next: (res: any) => {
          this.variations = res.data || [];
          this.applyFilters();
          this.isFetching = false;
        },
        error: (err) => {
          console.error('Error al cargar presentaciones:', err);
          this._messageService.error('Error', 'No se pudieron cargar las presentaciones de productos.');
          this.isFetching = false;
        }
      });
  }

  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  public applyFilters(): void {
    const rawFilter = this.searchTerm.toLowerCase().trim();
    const normalizedFilter = this.removeAccents(rawFilter);

    this.filteredVariations = this.variations.filter(v => {
      // Filtro de Stock
      if (this.stockStatus === 'IN_STOCK' && v.prov_stock <= 0) return false;
      if (this.stockStatus === 'OUT_OF_STOCK' && v.prov_stock > 0) return false;

      // Filtro de Texto (SKU, nombre de variación, nombre del producto)
      if (!normalizedFilter) return true;

      const varName = this.removeAccents(v.prov_name.toLowerCase());
      const varSku = v.prov_sku.toLowerCase();
      const prodName = v.pro_name ? this.removeAccents(v.pro_name.toLowerCase()) : '';
      const prodCode = v.prov_code ? v.prov_code.toLowerCase() : '';

      return varName.includes(normalizedFilter) || 
             varSku.includes(normalizedFilter) || 
             prodName.includes(normalizedFilter) ||
             prodCode.includes(normalizedFilter);
    });

    this.pageIndex = 1; // Resetear paginación al filtrar
  }

  public resetFilters(): void {
    this.searchTerm = '';
    this.stockStatus = 'ALL';
    this.applyFilters();
  }

  public editVariation(v: ProductVariationInterface): void {
    if (v.pro_uuid && v.prov_uuid) {
      this._router.navigate(['/application/product-variation', v.pro_uuid, v.prov_uuid]);
    } else {
      this._messageService.warning('Advertencia', 'Faltan identificadores para editar esta presentación.');
    }
  }

  public exportToCsv(): void {
    if (this.filteredVariations.length === 0) {
      this._messageService.warning('Advertencia', 'No hay datos en la lista para exportar.');
      return;
    }

    // Cabeceras
    const headers = [
      'SKU',
      'Presentacion',
      'Producto',
      'Material',
      'Color',
      'Talle',
      'Precio',
      'Stock'
    ];

    // Mapear filas
    const rows = this.filteredVariations.map(v => [
      v.prov_sku || '',
      v.prov_name || '',
      v.pro_name || '',
      v.gmat_name || '',
      v.prov_color || '',
      v.prov_size || '',
      v.prov_suggestedminimumsellingprice || 0,
      v.prov_stock || 0
    ]);

    // Convertir a CSV delimitado por punto y coma (apropiado para Excel en español)
    const separator = ';';
    const csvContent = 'sep=;\r\n' + 
      headers.map(h => this.escapeCSVField(h)).join(separator) + '\r\n' +
      rows.map(row => row.map(field => this.escapeCSVField(field.toString())).join(separator)).join('\r\n');

    // Descarga
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lista_precios_presentaciones_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this._messageService.success('Exportación Exitosa', 'Se ha descargado la lista de precios.');
  }

  private escapeCSVField(val: string): string {
    const escaped = val.replace(/"/g, '""');
    if (escaped.includes(';') || escaped.includes('\n') || escaped.includes('\r') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  }
}
