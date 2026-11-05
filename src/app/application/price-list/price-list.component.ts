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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { ProductVariationsService } from '@services/product-variations.service';
import { CameraComponent } from '../../shared/components/camera/camera.component';
import { MessageService } from '@services/message.service';
import { StorageService } from '@services/storage.service';
import { SessionService } from '@services/session.service';

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
    NzImageModule,
    NzInputNumberModule,
    NzToolTipModule,
    CameraComponent
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
  activeCameraRowId: string | null = null; // Fila que tiene activa la cámara

  formatterDollar = (value: number): string => `$ ${value}`;
  parserDollar = (value: string): number => Number(value.replace(/\$\s?|(,*)/g, '')) || 0;

  constructor(
    private _productVariationsService: ProductVariationsService,
    private message: NzMessageService,
    private _messageService: MessageService,
    private _storageService: StorageService,
    private _sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this._productVariationsService.getProductsVariations('28a0036e-2d6b-4e83-805a-1ca214a6b1e1', '').subscribe((products: any) => {
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
    // Al colapsar la fila, también apagamos cualquier cámara activa en ella
    if (!this.expandedRows[id] && this.activeCameraRowId === id) {
      this.activeCameraRowId = null;
    }
  }

  private updateProductVariation(productVariation: any): void {
    this._productVariationsService.updateProductVariation(productVariation).subscribe(
      (response: any) => {
        if (response.success) {
          this._messageService.success(
            "Informacion",
            "El Producto fue actualizado correctamente.",
            () => {
            }
          );
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  saveNewPhoto(product: ProductVariationInterface, capturedDataUrl: string): void {
    this.activeCameraRowId = null;
    const usr_uuid = this._sessionService.getIdentity()?.usr_uuid || 'admin';
    const filename = `camera_${product.prov_uuid || Date.now()}.webp`;

    this._messageService.info('Subiendo imagen', 'Procesando y guardando captura en Cloudflare R2...');

    this._storageService.compressToWebpBlob(capturedDataUrl, { maxWidth: 1000, maxHeight: 1000, quality: 0.85 })
      .then(({ blob }) => {
        this._storageService.uploadFile(blob, filename, usr_uuid, {
          bucketType: 'public',
          folder: 'products/variations',
          contentType: 'image/webp'
        }).subscribe({
          next: (uploadData) => {
            product.prov_image = uploadData.key;
            this.updateProductVariation(product);
            this._messageService.success('Foto guardada', 'La imagen fue almacenada en Cloudflare R2 exitosamente.');
          },
          error: (err) => {
            console.error('Error al subir captura de cámara a R2:', err);
            this._messageService.error('Error', 'No se pudo subir la foto tomada a Cloudflare R2.');
          }
        });
      })
      .catch((err) => {
        console.error('Error al procesar foto a WebP:', err);
        this._messageService.error('Error', 'No se pudo procesar la foto.');
      });
  }

  savePrice(product: ProductVariationInterface): void {
    this.updateProductVariation(product);
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
