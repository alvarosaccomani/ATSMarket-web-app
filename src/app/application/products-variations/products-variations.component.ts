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
import { CompaniesSettingsService } from '@services/companies-settings.service';

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

  // Export Modal State
  public isExportModalVisible: boolean = false;
  public exportType: 'CSV' | 'PDF' = 'PDF';
  public isGeneratingPdf: boolean = false;

  // Report Templates State
  public reportTemplates: any[] = [];
  public selectedTemplateId: string = 'default';
  public activeTemplate: any = null;
  private _rawReportsSetting: any = null;

  // Inline template creation
  public isCreatingNewTemplate: boolean = false;
  public newTemplateName: string = '';

  constructor(
    private _router: Router,
    private _sessionService: SessionService,
    private _productVariationsService: ProductVariationsService,
    private _messageService: MessageService,
    private _companiesService: CompaniesService,
    private _settingsService: CompaniesSettingsService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.activeCompany = company;
      this.activeCompanyUuid = company.cmp_uuid;
      this.loadVariations();
      this.loadFullCompanyDetails();
      this.loadCompanySettings();
    } else {
      this.isFetching = false;
      this._messageService.error('Error', 'No se encontró una tienda activa en la sesión.');
    }
  }

  public loadCompanySettings(): void {
    this._settingsService.getCompaniesSettings(this.activeCompanyUuid).subscribe({
      next: (res: any) => {
        const dbSettings: any[] = res?.data || [];
        this._rawReportsSetting = dbSettings.find(s => s.cmps_key === 'PDF_REPORTS_CONFIG');
        
        let parsed: any[] = [];
        if (this._rawReportsSetting && this._rawReportsSetting.cmps_value) {
          try {
            parsed = JSON.parse(this._rawReportsSetting.cmps_value);
          } catch (e) {
            console.error('Error al parsear PDF_REPORTS_CONFIG:', e);
          }
        }

        // Inicializar con plantilla por defecto si está vacía
        if (!Array.isArray(parsed) || parsed.length === 0) {
          parsed = [this.getDefaultTemplate()];
        }

        // Asegurar retrocompatibilidad para el color
        parsed.forEach(t => {
          if (!t.primaryColor) {
            t.primaryColor = this.activeCompany?.cmp_primarycolor || '#262626';
          }
        });

        this.reportTemplates = parsed;
        this.selectedTemplateId = this.reportTemplates[0].id;
        this.activeTemplate = this.reportTemplates[0];
        console.log('Plantillas de reportes cargadas:', this.reportTemplates);
      },
      error: (err) => {
        console.error('Error al cargar configuraciones de reportes:', err);
        this.reportTemplates = [this.getDefaultTemplate()];
        this.selectedTemplateId = 'default';
        this.activeTemplate = this.reportTemplates[0];
      }
    });
  }

  public getDefaultTemplate() {
    return {
      id: 'default',
      name: 'Lista de Precios Principal',
      title: 'CATÁLOGO DE PRECIOS OFICIAL',
      includeContact: true,
      includeQr: true,
      showAvailability: true,
      showMaterial: true,
      showZeroPriceItems: true,
      dateFormat: 'full',
      timeFormat: '12h',
      columns: {
        sku: 'SKU',
        product: 'Producto / Presentación',
        material: 'Material',
        specs: 'Color / Talle',
        price: 'Precio',
        status: 'Estado'
      }
    };
  }

  public onTemplateChange(id: string): void {
    const found = this.reportTemplates.find(t => t.id === id);
    if (found) {
      this.activeTemplate = found;
    }
  }

  public enableCreateTemplateMode(): void {
    this.isCreatingNewTemplate = true;
    this.newTemplateName = '';
  }

  public cancelCreateTemplate(): void {
    this.isCreatingNewTemplate = false;
    this.newTemplateName = '';
  }

  public confirmCreateTemplate(): void {
    const name = this.newTemplateName.trim();
    if (!name) {
      this._messageService.warning('Advertencia', 'El nombre de la plantilla no puede estar vacío.');
      return;
    }

    const newId = 'template_' + Date.now();
    const newTemp = {
      id: newId,
      name: name,
      title: name.toUpperCase(),
      includeContact: this.activeTemplate?.includeContact ?? true,
      includeQr: this.activeTemplate?.includeQr ?? true,
      showAvailability: this.activeTemplate?.showAvailability ?? true,
      showMaterial: this.activeTemplate?.showMaterial ?? true,
      showZeroPriceItems: this.activeTemplate?.showZeroPriceItems ?? true,
      dateFormat: this.activeTemplate?.dateFormat ?? 'full',
      timeFormat: this.activeTemplate?.timeFormat ?? '12h',
      columns: { ...this.activeTemplate?.columns || this.getDefaultTemplate().columns }
    };

    this.reportTemplates.push(newTemp);
    this.selectedTemplateId = newId;
    this.activeTemplate = newTemp;
    this.isCreatingNewTemplate = false;
    this.newTemplateName = '';
    this._messageService.success('Plantilla Creada', `Se creó la plantilla "${name}". Recordá guardar tus configuraciones.`);
  }

  public deleteActiveTemplate(): void {
    if (this.reportTemplates.length <= 1) {
      this._messageService.warning('Advertencia', 'Tenés que conservar al menos una plantilla de reporte.');
      return;
    }

    const name = this.activeTemplate?.name || 'la plantilla actual';
    this._messageService.confirm(
      '¿Eliminar Plantilla?',
      `¿Deseas eliminar la plantilla "${name}"? Esta acción se guardará de forma permanente al presionar "Guardar Cambios".`,
      () => {
        const index = this.reportTemplates.findIndex(t => t.id === this.selectedTemplateId);
        if (index > -1) {
          this.reportTemplates.splice(index, 1);
          this.selectedTemplateId = this.reportTemplates[0].id;
          this.activeTemplate = this.reportTemplates[0];
          this._messageService.info('Plantilla Eliminada', `Se eliminó la plantilla de la lista.`);
        }
      }
    );
  }

  public saveReportTemplates(): void {
    if (!this._rawReportsSetting) {
      this._rawReportsSetting = {
        cmp_uuid: this.activeCompanyUuid,
        cmps_key: 'PDF_REPORTS_CONFIG',
        cmps_parameter: 'Configuración de Reportes PDF',
        cmps_description: 'Almacena de manera interna las plantillas de catálogos y listas de precios en formato PDF configuradas por el comercio.',
        cmps_datatype: 'string',
        cmps_group: 'Reportes PDF',
        cmps_options: '',
        cmps_createdat: new Date()
      };
    }

    this._rawReportsSetting.cmps_value = JSON.stringify(this.reportTemplates);
    this._rawReportsSetting.cmps_updatedat = new Date();
    
    const isNew = !this._rawReportsSetting.cmps_uuid || this._rawReportsSetting.cmps_uuid.length < 5;

    const payload = { ...this._rawReportsSetting };
    let request$;
    if (isNew) {
      delete payload.cmps_uuid;
      request$ = this._settingsService.saveCompanySetting(payload);
    } else {
      request$ = this._settingsService.updateCompanySetting(payload);
    }

    this.isGeneratingPdf = true;
    request$.subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this._rawReportsSetting = res.data;
        }
        this.isGeneratingPdf = false;
        this._messageService.success('Configuraciones Guardadas', 'Las plantillas se guardaron de forma permanente.');
      },
      error: (err) => {
        console.error('Error al guardar plantillas:', err);
        this.isGeneratingPdf = false;
        this._messageService.error('Error', 'No se pudieron guardar las configuraciones de reportes.');
      }
    });
  }

  public loadFullCompanyDetails(): void {
    this._companiesService.getCompanyById(this.activeCompanyUuid).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const fullCompany = Array.isArray(res.data) ? res.data[0] : res.data;
          this.activeCompany = { ...this.activeCompany, ...fullCompany };
          console.log('Información completa de la tienda cargada:', this.activeCompany);
          
          // Parchear color institucional por defecto a las plantillas si no lo tienen seteado
          if (this.reportTemplates && this.reportTemplates.length > 0) {
            this.reportTemplates.forEach(t => {
              if (!t.primaryColor || t.primaryColor === '#262626') {
                t.primaryColor = this.activeCompany?.cmp_primarycolor || '#262626';
              }
            });
            if (this.activeTemplate && (!this.activeTemplate.primaryColor || this.activeTemplate.primaryColor === '#262626')) {
              this.activeTemplate.primaryColor = this.activeCompany?.cmp_primarycolor || '#262626';
            }
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar detalles completos de la tienda:', err);
      }
    });
  }

  public hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace(/^#/, '');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return [38, 38, 38];
    }
    return [r, g, b];
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
      if (this.stockStatus === 'IN_STOCK' && v.prov_stock <= 0) return false;
      if (this.stockStatus === 'OUT_OF_STOCK' && v.prov_stock > 0) return false;

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

    this.pageIndex = 1;
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

    const separator = ';';
    const csvContent = 'sep=;\r\n' + 
      headers.map(h => this.escapeCSVField(h)).join(separator) + '\r\n' +
      rows.map(row => row.map(field => this.escapeCSVField(field.toString())).join(separator)).join('\r\n');

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

    const template = this.activeTemplate || this.getDefaultTemplate();
    const cols = template.columns || this.getDefaultTemplate().columns;

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
      const headerColor = this.hexToRgb(template.primaryColor || '#1f1f1f');
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
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
      doc.text((template.title || 'CATÁLOGO DE PRECIOS OFICIAL').toUpperCase(), 14, 25);

      // Fecha
      let dateString = '';
      if (template.dateFormat === 'full') {
        const use12h = template.timeFormat !== '24h';
        const today = new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: use12h
        });
        dateString = `Generado el: ${today}`;
      } else if (template.dateFormat === 'date') {
        const today = new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        dateString = `Generado el: ${today}`;
      }

      if (dateString) {
        doc.setFontSize(9);
        doc.setTextColor(160, 160, 160);
        doc.text(dateString, 14, 32);
      }

      // 2. DETALLES DE CONTACTO Y CÓDIGO QR
      let startY = 48;

      if (template.includeContact || (template.includeQr && companySlug)) {
        const boxHeight = template.includeContact ? 32 : 26;
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(14, 45, 182, boxHeight, 3, 3, 'FD');

        let textX = 20;
        let textY = 52;

        if (template.includeContact) {
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
        } else if (template.includeQr && companySlug) {
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
        if (template.includeQr && companySlug) {
          const marketLink = `${window.location.origin}/home-store/${companySlug}`;
          const qrSize = template.includeContact ? 25 : 20;
          const qrX = 165;
          const qrY = template.includeContact ? 48 : 47;

          try {
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(marketLink)}`;
            const qrBase64 = await this.getBase64ImageFromUrl(qrApiUrl);
            doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
            
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
      const tableHeaders = [
        cols.sku || 'SKU',
        cols.product || 'Producto / Presentación'
      ];
      if (template.showMaterial !== false) {
        tableHeaders.push(cols.material || 'Material');
      }
      tableHeaders.push(cols.specs || 'Color / Talle');
      tableHeaders.push(cols.price || 'Precio');
      if (template.showAvailability) {
        tableHeaders.push(cols.status || 'Estado');
      }

      let variationsToExport = this.filteredVariations;
      if (template.showZeroPriceItems === false) {
        variationsToExport = variationsToExport.filter(v => {
          const price = v.prov_suggestedminimumsellingprice;
          return price !== null && price !== undefined && price > 0;
        });
      }

      const tableRows = variationsToExport.map(v => {
        const productName = v.pro_name ? `${v.pro_name} - ${v.prov_name}` : v.prov_name;
        const row = [
          v.prov_sku || '-',
          productName.trim()
        ];
        if (template.showMaterial !== false) {
          row.push(v.gmat_name || '-');
        }
        row.push([v.prov_color, v.prov_size].filter(Boolean).join(' / ') || '-');
        row.push(`$ ${v.prov_suggestedminimumsellingprice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        if (template.showAvailability) {
          row.push(v.prov_stock > 0 ? 'Disponible' : 'Agotado');
        }
        return row;
      });

      const dynamicColumnStyles: any = {};
      let colIdx = 0;
      // SKU
      dynamicColumnStyles[colIdx++] = { cellWidth: 32 };
      // Producto
      dynamicColumnStyles[colIdx++] = { cellWidth: 'auto' };
      // Material
      if (template.showMaterial !== false) {
        dynamicColumnStyles[colIdx++] = { cellWidth: 28 };
      }
      // Color/Talle (Specs)
      dynamicColumnStyles[colIdx++] = { cellWidth: 28 };
      // Precio (Alineación derecha)
      dynamicColumnStyles[colIdx++] = { cellWidth: 28, halign: 'right' };
      // Estado (si está, alineación centro)
      if (template.showAvailability) {
        dynamicColumnStyles[colIdx++] = { cellWidth: 25, halign: 'center' };
      }

      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: startY,
        theme: 'striped',
        headStyles: {
          fillColor: this.hexToRgb(template.primaryColor || '#262626'),
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        columnStyles: dynamicColumnStyles,
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('Generado automáticamente por ATS Market', 14, 287);
          doc.text(`Página ${data.pageNumber}`, 180, 287);
        }
      });

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
