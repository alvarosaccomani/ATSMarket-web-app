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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { ProductVariationsService } from '@services/product-variations.service';
import { SessionService } from '@services/session.service';
import { MessageService } from '@services/message.service';
import { CompaniesService } from '@services/companies.service';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    NzSelectModule,
    NzModalModule,
    NzCheckboxModule
  ],
  templateUrl: './products-variations.component.html',
  styleUrl: './products-variations.component.scss'
})
export class ProductsVariationsComponent implements OnInit {

  public activeCompany: any = null;
  public activeCompanyUuid: string = '';
  public variations: ProductVariationInterface[] = [];
  public filteredVariations: ProductVariationInterface[] = [];
  public isFetching: boolean = true;

  public searchTerm: string = '';
  public stockStatus: 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' = 'ALL';
  public pageIndex: number = 1;
  public pageSize: number = 20;

  // Export State
  public isExportModalVisible: boolean = false;
  public exportType: 'CSV' | 'PDF' = 'PDF';
  
  // PDF configurations
  public pdfShowAvailability: boolean = true;
  public pdfIncludeContact: boolean = true;
  public pdfIncludeQr: boolean = true;
  public isGeneratingPdf: boolean = false;

  constructor(
    private _router: Router,
    private _sessionService: SessionService,
    private _productVariationsService: ProductVariationsService,
    private _messageService: MessageService,
    private _companiesService: CompaniesService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.activeCompany = company;
      this.activeCompanyUuid = company.cmp_uuid;
      this.loadVariations();
      this.loadFullCompanyDetails();
    } else {
      this.isFetching = false;
      this._messageService.error('Error', 'No se encontró una tienda activa en la sesión.');
    }
  }

  public loadFullCompanyDetails(): void {
    this._companiesService.getCompanyById(this.activeCompanyUuid).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const fullCompany = Array.isArray(res.data) ? res.data[0] : res.data;
          this.activeCompany = { ...this.activeCompany, ...fullCompany };
          console.log('Información completa de la tienda cargada:', this.activeCompany);
        }
      },
      error: (err) => {
        console.error('Error al cargar detalles completos de la tienda:', err);
      }
    });
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

  public openExportModal(): void {
    this.isExportModalVisible = true;
  }

  public confirmExport(): void {
    if (this.exportType === 'PDF') {
      this.exportToPdf();
    } else {
      this.exportToCsv();
      this.isExportModalVisible = false;
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

  private getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          reject(new Error('Failed to get 2D context'));
        }
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = imageUrl;
    });
  }

  public async exportToPdf(): Promise<void> {
    if (this.filteredVariations.length === 0) {
      this._messageService.warning('Advertencia', 'No hay datos en la lista para exportar.');
      return;
    }

    this.isGeneratingPdf = true;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const companyName = this.activeCompany?.cmp_name || 'Mi Comercio';
      const companyEmail = this.activeCompany?.cmp_email || '';
      const companyPhone = this.activeCompany?.cmp_phone || '';
      const companySlug = this.activeCompany?.cmp_slug || '';

      // 1. DIBUJAR CABECERA (Header)
      doc.setFillColor(31, 31, 31); // Color gris oscuro premium
      doc.rect(0, 0, 210, 40, 'F');

      // Título Tienda
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(companyName.toUpperCase(), 14, 18);

      // Subtítulo
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(200, 200, 200);
      doc.text('CATÁLOGO DE PRECIOS OFICIAL', 14, 25);

      // Fecha
      const today = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text(`Generado el: ${today}`, 14, 32);

      // 2. DETALLES DE CONTACTO Y CÓDIGO QR
      let startY = 48;

      if (this.pdfIncludeContact || (this.pdfIncludeQr && companySlug)) {
        // Reservar espacio dibujando una caja sutil
        const boxHeight = this.pdfIncludeContact ? 32 : 26;
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(14, 45, 182, boxHeight, 3, 3, 'FD');

        let textX = 20;
        let textY = 52;

        if (this.pdfIncludeContact) {
          doc.setTextColor(80, 80, 80);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('INFORMACIÓN DE CONTACTO:', textX, textY);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(100, 100, 100);
          
          let lineOffset = 6;
          if (companyEmail) {
            doc.text(`Email: ${companyEmail}`, textX, textY + lineOffset);
            lineOffset += 5;
          }
          if (companyPhone) {
            doc.text(`Teléfono: ${companyPhone}`, textX, textY + lineOffset);
            lineOffset += 5;
          }
          if (!companyEmail && !companyPhone) {
            doc.text('No se registra información de contacto pública.', textX, textY + lineOffset);
          }
        } else if (this.pdfIncludeQr && companySlug) {
          // Llenar el vacío izquierdo si el contacto está desactivado pero el QR sí está
          doc.setTextColor(80, 80, 80);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('COMPRÁ ONLINE EN NUESTRO MARKET:', textX, textY);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          
          const infoText = 'Escaneá el código QR de la derecha con tu celular para acceder a nuestro catálogo digital completo, ver stock actualizado en tiempo real y realizar tu pedido directamente.';
          const splitInfo = doc.splitTextToSize(infoText, 135);
          doc.text(splitInfo, textX, textY + 6);
        }

        // Agregar QR de Compras Online
        if (this.pdfIncludeQr && companySlug) {
          const marketLink = `${window.location.origin}/home-store/${companySlug}`;
          const qrSize = this.pdfIncludeContact ? 25 : 20;
          const qrX = 165;
          const qrY = this.pdfIncludeContact ? 48 : 47;

          try {
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(marketLink)}`;
            const qrBase64 = await this.getBase64ImageFromUrl(qrApiUrl);
            doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
            
            // Texto debajo del QR
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text('ESCANEA PARA COMPRAR', qrX - 2, qrY + qrSize + 4);
          } catch (qrErr) {
            console.error('Error cargando QR para PDF:', qrErr);
          }
        }

        startY = 45 + boxHeight + 8;
      }

      // 3. GENERAR TABLA DE PRECIOS
      const tableHeaders = ['SKU', 'Producto / Presentación', 'Material', 'Color / Talle', 'Precio'];
      if (this.pdfShowAvailability) {
        tableHeaders.push('Estado');
      }

      const tableRows = this.filteredVariations.map(v => {
        const productName = v.pro_name ? `${v.pro_name} - ${v.prov_name}` : v.prov_name;
        const row = [
          v.prov_sku || '-',
          productName.trim(),
          v.gmat_name || '-',
          [v.prov_color, v.prov_size].filter(Boolean).join(' / ') || '-',
          `$ ${v.prov_suggestedminimumsellingprice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
        if (this.pdfShowAvailability) {
          row.push(v.prov_stock > 0 ? 'Disponible' : 'Agotado');
        }
        return row;
      });

      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: startY,
        theme: 'striped',
        headStyles: {
          fillColor: [38, 38, 38], // Gris antracita sofisticado (#262626) para un look premium
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 32 }, // SKU
          1: { cellWidth: 'auto' }, // Producto
          2: { cellWidth: 28 }, // Material
          3: { cellWidth: 28 }, // Color/Talle
          4: { cellWidth: 28, halign: 'right' }, // Precio
          5: { cellWidth: 25, halign: 'center' } // Estado (si está presente)
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer de página
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          
          // Izquierda
          doc.text('Generado automáticamente por ATS Market', 14, 287);
          
          // Derecha
          doc.text(`Página ${data.pageNumber}`, 180, 287);
        }
      });

      // Guardar archivo
      const formattedDate = new Date().toISOString().slice(0, 10);
      doc.save(`lista_precios_${companyName.toLowerCase().replace(/\s+/g, '_')}_${formattedDate}.pdf`);
      
      this._messageService.success('Exportación Exitosa', 'El PDF de precios se ha descargado correctamente.');
      this.isExportModalVisible = false;
    } catch (err) {
      console.error('Error al generar PDF:', err);
      this._messageService.error('Error', 'No se pudo generar el documento PDF.');
    } finally {
      this.isGeneratingPdf = false;
    }
  }
}
