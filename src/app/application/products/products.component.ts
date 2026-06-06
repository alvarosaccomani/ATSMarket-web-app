import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of, catchError, switchMap } from 'rxjs';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { ProductInterface } from '@interfaces/product';
import { SessionService } from '@services/session.service';
import { ProductsService } from '@services/products.service';
import { MessageService } from '@services/message.service';
import { StockMovementsService } from '@services/stock-movements.service';
import { ItemsService } from '@services/items.service';
import { CategoriesService } from '@services/categories.service';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { GlobalItemsService } from '@services/global-items.service';
import { MaterialsService } from '@services/materials.service';
import { GlobalMaterialsService } from '@services/global-materials.service';
import { StockMovementInterface } from '@interfaces/stock-movement/stock-movement.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzEmptyModule,
    NzToolTipModule,
    NzCardModule,
    NzInputModule,
    NzAvatarModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzTabsModule,
    NzTimelineModule,
    NzSpinModule,
    NzSelectModule,
    NzProgressModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {

  private productsSubject$ = new BehaviorSubject<ProductInterface[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');
  public filteredProducts$!: Observable<ProductInterface[]>;
  
  public isFetching: boolean = true;

  // Drawer Control
  public selectedProduct: ProductInterface | null = null;
  public isDrawerVisible = false;

  // Stock Movements State
  public isLoadingMovements: boolean = false;
  public allMovements: StockMovementInterface[] = [];
  public filteredMovements: StockMovementInterface[] = [];
  public selectedVariationFilter: string = 'ALL';
  public activeTab: number = 0;

  // Bulk Import State
  public isBulkImportModalVisible: boolean = false;
  public importStep: number = 1;
  public importMethod: 'csv' | 'excel' = 'excel';
  public pastedText: string = '';
  public parsedProducts: any[] = [];
  public isImporting: boolean = false;
  public importProgress: number = 0;
  public importLog: string[] = [];
  private categoryMap = new Map<string, { cat_uuid: string, itm_uuid: string }>();
  private itemMap = new Map<string, { itm_uuid: string, gitm_uuid: string }>();
  private materialMap = new Map<string, { mat_uuid: string, gmat_uuid: string }>();
  public activeCompanyUuid: string = '';
  
  // Missing Items & Categories Wizard Helper State
  public missingItemMappings: { [key: string]: string } = {};
  public isCreatingItem: { [key: string]: boolean } = {};
  public missingCategoryMappings: { [key: string]: string } = {};
  public isCreatingCategory: { [key: string]: boolean } = {};
  public missingMaterialMappings: { [key: string]: string } = {};
  public isCreatingMaterial: { [key: string]: boolean } = {};
  public shopItems: any[] = [];
  public shopMaterials: any[] = [];
  public globalItems: any[] = [];
  public globalCategories: any[] = [];
  public globalMaterials: any[] = [];

  constructor(
    private _router: Router,
    private modal: NzModalService,
    private _sessionService: SessionService,
    private _productService: ProductsService,
    private _messageService: MessageService,
    private _stockMovementsService: StockMovementsService,
    private _itemsService: ItemsService,
    private _categoriesService: CategoriesService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _globalItemsService: GlobalItemsService,
    private _materialsService: MaterialsService,
    private _globalMaterialsService: GlobalMaterialsService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    this.activeCompanyUuid = company.cmp_uuid;
    this.getProducts(this.activeCompanyUuid);
    this.preloadCategoriesMap(this.activeCompanyUuid);

    // Búsqueda reactiva
    this.filteredProducts$ = combineLatest([
      this.productsSubject$.asObservable(),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([products, term]) => {
        if (!term.trim()) return products;
        const lowTerm = term.toLowerCase();
        return products.filter(p => 
          p.pro_name.toLowerCase().includes(lowTerm) || 
          p.pro_code.toLowerCase().includes(lowTerm)
        );
      })
    );
  }

  public getProducts(cmp_uuid: string): void {
    this.isFetching = true;
    this._productService.getProducts(cmp_uuid).subscribe({
      next: (res: any) => {
        this.productsSubject$.next(res.data || []);
        this.isFetching = false;
      },
      error: (error) => {
        console.error('Error fetching products', error);
        this.isFetching = false;
        this._messageService.error('Error', 'No se pudieron cargar los productos.');
      }
    });
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openQuickDetail(product: ProductInterface): void {
    this.selectedProduct = product;
    this.isDrawerVisible = true;
    this.activeTab = 0; // Resetear siempre a pestaña de información
    this.loadStockMovements(product.pro_uuid);
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedProduct = null, 300);
  }

  public abrirModalNuevo(): void {
    // Por ahora redirigimos al componente singular de creación
    this._router.navigate(['/application/product', 'new']);
  }

  public editProduct(product: ProductInterface): void {
    this._router.navigate(['/application/product', product.pro_uuid]);
  }

  public deleteProduct(product: ProductInterface): void {
    this._messageService.confirm(
      '¿Eliminar Producto?',
      `Esta acción eliminará el producto "${product.pro_name}" y todas sus variaciones. ¿Deseas continuar?`,
      () => {
        // Lógica de eliminación...
        this._messageService.info('Módulo en desarrollo', 'La eliminación de productos maestros se habilitará próximamente.');
      }
    );
  }

  // --- INVENTARIO / HISTORIAL DE STOCK ---

  public loadStockMovements(pro_uuid: string): void {
    const company = this._sessionService.getCompany();
    if (!company || !company.cmp_uuid) return;

    this.isLoadingMovements = true;
    this.selectedVariationFilter = 'ALL';
    this.allMovements = [];
    this.filteredMovements = [];

    this._stockMovementsService.getStockMovements(company.cmp_uuid).subscribe({
      next: (res) => {
        // Filtrar solo los movimientos asociados al producto actual
        this.allMovements = (res.data || []).filter(m => m.pro_uuid === pro_uuid);
        this.applyVariationFilter();
        this.isLoadingMovements = false;
      },
      error: (err) => {
        console.error('Error fetching stock movements', err);
        this.isLoadingMovements = false;
      }
    });
  }

  public applyVariationFilter(): void {
    if (this.selectedVariationFilter === 'ALL') {
      this.filteredMovements = [...this.allMovements];
    } else {
      this.filteredMovements = this.allMovements.filter(
        m => m.prov_uuid === this.selectedVariationFilter
      );
    }
  }

  public getVariationName(prov_uuid: string): string {
    if (!this.selectedProduct || !this.selectedProduct.productVariations) return 'Variación';
    const v = this.selectedProduct.productVariations.find(item => item.prov_uuid === prov_uuid);
    return v ? v.prov_name : 'Variación';
  }

  public getMovementTypeColor(type: string): string {
    switch (type) {
      case 'IN': return 'green';
      case 'OUT': return 'red';
      case 'ADJUSTMENT': return 'orange';
      default: return 'gray';
    }
  }

  public getMovementTypeLabel(type: string): string {
    switch (type) {
      case 'IN': return 'Ingreso';
      case 'OUT': return 'Venta';
      case 'ADJUSTMENT': return 'Ajuste';
      default: return 'Otro';
    }
  }

  public getMovementIcon(type: string): string {
    switch (type) {
      case 'IN': return 'arrow-down';
      case 'OUT': return 'shopping-cart';
      case 'ADJUSTMENT': return 'tool';
      default: return 'question';
    }
  }

  // --- BULK PRODUCT IMPORT WIZARD ---

  private preloadCategoriesMap(cmp_uuid: string): void {
    this.categoryMap.clear();
    this.itemMap.clear();
    this.materialMap.clear();
    this.shopItems = [];
    this.shopMaterials = [];

    // Preload materials first
    this._materialsService.getMaterials(cmp_uuid).subscribe({
      next: (res: any) => {
        const materials = res.data || [];
        this.shopMaterials = materials;
        materials.forEach((mat: any) => {
          const matNameKey = mat.mat_name.toLowerCase().trim();
          this.materialMap.set(matNameKey, {
            mat_uuid: mat.mat_uuid,
            gmat_uuid: mat.gmat_uuid
          });
        });
        console.log('Materials preloaded for bulk import:', this.materialMap.size);

        // Continue with items and categories
        this.preloadItemsAndCategories(cmp_uuid);
      },
      error: (err) => {
        console.error('Error preloading materials', err);
        this.preloadItemsAndCategories(cmp_uuid);
      }
    });
  }

  private preloadItemsAndCategories(cmp_uuid: string): void {
    this._itemsService.getItems(cmp_uuid).subscribe({
      next: (res: any) => {
        const items = res.data || [];
        this.shopItems = items;
        items.forEach((itm: any) => {
          const itemNameKey = itm.itm_name.toLowerCase().trim();
          this.itemMap.set(itemNameKey, {
            itm_uuid: itm.itm_uuid,
            gitm_uuid: itm.gitm_uuid
          });
        });
        if (items.length === 0) return;

        const categoryRequests: Observable<any>[] = items.map((itm: any) => 
          this._categoriesService.getCategories(cmp_uuid, itm.itm_uuid).pipe(
            map((cRes: any) => ({ itm_uuid: itm.itm_uuid, categories: cRes.data || [] }))
          )
        );

        forkJoin(categoryRequests).subscribe({
          next: (results: any) => {
            results.forEach((resGroup: any) => {
              resGroup.categories.forEach((cat: any) => {
                const nameKey = (cat.cat_name || cat.gcat_name || '').toLowerCase().trim();
                const compositeKey = `${resGroup.itm_uuid}_${nameKey}`;
                this.categoryMap.set(compositeKey, { 
                  cat_uuid: cat.cat_uuid, 
                  itm_uuid: resGroup.itm_uuid 
                });
              });
            });
            console.log('Categories preloaded for bulk import:', this.categoryMap.size);
          },
          error: (err) => {
            console.error('Error preloading categories for bulk import', err);
          }
        });
      },
      error: (err) => {
        console.error('Error loading items for bulk import preloading', err);
      }
    });
  }

  private loadGlobalItemsAndCategories(): void {
    this._globalItemsService.getGlobalItems().subscribe({
      next: (res: any) => this.globalItems = res.data || [],
      error: (err) => console.error('Error loading global items:', err)
    });
    this._globalCategoriesService.getGlobalCategories().subscribe({
      next: (res: any) => this.globalCategories = res.data || [],
      error: (err) => console.error('Error loading global categories:', err)
    });
    this._globalMaterialsService.getGlobalMaterials().subscribe({
      next: (res: any) => this.globalMaterials = res.data || [],
      error: (err) => console.error('Error loading global materials:', err)
    });
  }

  public openBulkImportModal(): void {
    this.importStep = 1;
    this.pastedText = '';
    this.parsedProducts = [];
    this.isImporting = false;
    this.importProgress = 0;
    this.importLog = [];
    this.isBulkImportModalVisible = true;
    this.preloadCategoriesMap(this.activeCompanyUuid);
    this.loadGlobalItemsAndCategories();
  }

  public closeBulkImportModal(): void {
    if (this.isImporting) {
      this._messageService.warning('Advertencia', 'La importación está en progreso. Por favor, espera a que termine.');
      return;
    }
    this.isBulkImportModalVisible = false;
  }

  public downloadTemplate(format: 'csv' | 'excel'): void {
    const headers = [
      'Código de Producto',
      'Nombre de Producto',
      'Descripción',
      'Rubro de Producto',
      'Categoría',
      'SKU de Variante',
      'Nombre de Variante',
      'Material',
      'Color',
      'Tamaño',
      'Precio',
      'Stock',
      'URL de Imagen'
    ];
    
    const sampleRow1 = [
      'PROD-REMERA',
      'Remera Deportiva Nike',
      'Remera Dry-Fit Premium de Poliéster',
      'Deportes',
      'Indumentaria',
      'TSH-NIKE-M',
      'Talle M',
      'Poliéster',
      'Azul',
      'M',
      '8500',
      '20',
      'https://example.com/nike-m.jpg'
    ];
    
    const sampleRow2 = [
      'PROD-REMERA',
      'Remera Deportiva Nike',
      'Remera Dry-Fit Premium de Poliéster',
      'Deportes',
      'Indumentaria',
      'TSH-NIKE-L',
      'Talle L',
      'Algodón',
      'Rojo',
      'L',
      '9000',
      '15',
      'https://example.com/nike-l.jpg'
    ];

    const separator = format === 'csv' ? ',' : ';';
    
    let csvContent = '';
    if (format === 'excel') {
      csvContent += 'sep=;\r\n';
    }
    
    const escapeCSV = (val: string) => {
      const escaped = val.replace(/"/g, '""');
      if (escaped.includes(separator) || escaped.includes('\n') || escaped.includes('\r') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    csvContent += headers.map(escapeCSV).join(separator) + '\r\n';
    csvContent += sampleRow1.map(escapeCSV).join(separator) + '\r\n';
    csvContent += sampleRow2.map(escapeCSV).join(separator) + '\r\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plantilla_productos_atsmarket.${format === 'csv' ? 'csv' : 'csv'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this._messageService.success('Descarga Iniciada', `Se ha descargado la plantilla para ${format === 'csv' ? 'CSV' : 'Excel'} con datos de ejemplo.`);
  }

  public handleFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.pastedText = e.target.result || '';
      this._messageService.success('Archivo Cargado', `Se leyó el archivo "${file.name}" correctamente.`);
    };
    reader.readAsText(file, 'UTF-8');
  }

  private parseCSV(text: string): string[][] {
    const lines = text.split(/\r\n|\n/);
    return lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const separator = line.includes(';') ? ';' : ',';
        const result: string[] = [];
        let currentField = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === separator && !inQuotes) {
            result.push(currentField);
            currentField = '';
          } else {
            currentField += char;
          }
        }
        result.push(currentField);
        return result.map(f => f.trim().replace(/^"|"$/g, ''));
      });
  }

  private parseTSV(text: string): string[][] {
    const lines = text.split(/\r\n|\n/);
    return lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.split('\t').map(f => f.trim()));
  }

  public parseAndValidateData(): void {
    if (!this.pastedText.trim()) {
      this._messageService.warning('Advertencia', 'Por favor, ingresa o pega datos para validar.');
      return;
    }

    const cleanedText = this.pastedText.replace(/^\uFEFF/, '');

    const parsedRows = this.importMethod === 'excel' 
      ? this.parseTSV(cleanedText) 
      : this.parseCSV(cleanedText);

    const rows = parsedRows.filter(r => {
      if (r.length > 0 && r[0].toLowerCase().startsWith('sep=')) {
        return false;
      }
      return true;
    });

    if (rows.length === 0) {
      this._messageService.error('Error', 'No se encontraron filas de datos para procesar.');
      return;
    }

    let startIndex = 0;
    const firstRowJoined = rows[0].join(' ').toLowerCase();
    if (
      firstRowJoined.includes('código') || 
      firstRowJoined.includes('codigo') || 
      firstRowJoined.includes('nombre') || 
      firstRowJoined.includes('sku') || 
      firstRowJoined.includes('precio') || 
      firstRowJoined.includes('descripción') ||
      firstRowJoined.includes('descripcion') ||
      firstRowJoined.includes('rubro') ||
      firstRowJoined.includes('categoría') ||
      firstRowJoined.includes('categoria') ||
      firstRowJoined.includes('pro_code') ||
      firstRowJoined.includes('variante') ||
      firstRowJoined.includes('stock')
    ) {
      startIndex = 1;
    }

    const results: any[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 6) continue;

      let pro_code = row[0] || '';
      let pro_name = row[1] || '';
      let pro_description = row[2] || '';
      let item_name = row[3] || '';
      let category_name = row[4] || '';
      const prov_sku = row[5] || '';
      const prov_name = row[6] || 'Estándar';
      let material_name = row[7] || '';
      let prov_color = row[8] || '';
      let prov_size = row[9] || '';
      const priceVal = parseFloat(row[10]?.replace(/[^0-9.-]/g, '')) || 0;
      const stockVal = parseInt(row[11]?.replace(/[^0-9-]/g, '')) || 0;
      let pro_image = row[12] || '';

      const errors: string[] = [];
      const warnings: string[] = [];

      if (!pro_code.trim()) {
        errors.push('Código de Producto es obligatorio.');
      }

      const existingProduct = pro_code.trim()
        ? this.productsSubject$.value.find(p => p.pro_code.toLowerCase().trim() === pro_code.toLowerCase().trim())
        : null;

      const previousBatchProduct = pro_code.trim()
        ? results.find(r => r.pro_code.toLowerCase().trim() === pro_code.toLowerCase().trim())
        : null;

      let cat_uuid = '';
      let itm_uuid = '';
      let mat_uuid = '';
      let gmat_uuid = '';
      let isExistingMaster = false;
      let isExistingVariation = false;
      let previousStock = 0;

      if (existingProduct) {
        isExistingMaster = true;
        cat_uuid = existingProduct.cat_uuid;
        itm_uuid = existingProduct.itm_uuid;
        if (!pro_name.trim()) pro_name = existingProduct.pro_name;
        if (!pro_description.trim()) pro_description = existingProduct.pro_description || '';
        if (!pro_image.trim()) pro_image = existingProduct.pro_image || '';

        if (!item_name.trim()) {
          const foundItem = this.shopItems.find(itm => itm.itm_uuid === itm_uuid);
          if (foundItem) {
            item_name = foundItem.itm_name;
          }
        }
        if (!category_name.trim()) {
          for (const [key, value] of this.categoryMap.entries()) {
            if (value.cat_uuid === cat_uuid) {
              const parts = key.split('_');
              if (parts.length > 1) {
                category_name = parts.slice(1).join('_');
                category_name = category_name.charAt(0).toUpperCase() + category_name.slice(1);
              }
              break;
            }
          }
        }

        const existingVar = (existingProduct.productVariations || []).find(v => 
          v.prov_sku.toLowerCase().trim() === prov_sku.toLowerCase().trim()
        );

        if (existingVar) {
          isExistingVariation = true;
          previousStock = existingVar.prov_stock || 0;
          if (!material_name.trim() && existingVar.mat_uuid) {
            mat_uuid = existingVar.mat_uuid;
            gmat_uuid = existingVar.gmat_uuid || '';
            const foundMat = this.shopMaterials.find(m => m.mat_uuid === mat_uuid);
            if (foundMat) {
              material_name = foundMat.mat_name;
            }
          }
          if (!prov_color.trim() && existingVar.prov_color) {
            prov_color = existingVar.prov_color;
          }
          if (!prov_size.trim() && existingVar.prov_size) {
            prov_size = existingVar.prov_size;
          }
        }
      } else if (previousBatchProduct) {
        if (!pro_name.trim()) pro_name = previousBatchProduct.pro_name;
        if (!pro_description.trim()) pro_description = previousBatchProduct.pro_description;
        if (!item_name.trim()) item_name = previousBatchProduct.item_name;
        if (!category_name.trim()) category_name = previousBatchProduct.category_name;
        if (!pro_image.trim()) pro_image = previousBatchProduct.pro_image;
        cat_uuid = previousBatchProduct.cat_uuid;
        itm_uuid = previousBatchProduct.itm_uuid;
      }

      if (pro_code.trim() && !pro_name.trim()) errors.push('Nombre de Producto es obligatorio.');
      if (!prov_sku.trim()) errors.push('SKU de Variante es obligatorio.');
      if (!prov_name.trim()) errors.push('Nombre de Variante es obligatorio.');
      if (isNaN(priceVal) || priceVal < 0) errors.push('Precio debe ser positivo.');
      if (isNaN(stockVal) || stockVal < 0) errors.push('Stock debe ser mayor o igual a 0.');

      const skuDuplicatedInBatch = results.some(r => r.prov_sku.toLowerCase().trim() === prov_sku.toLowerCase().trim());
      if (skuDuplicatedInBatch) {
        errors.push(`El SKU "${prov_sku}" está repetido en el archivo.`);
      }

      if (material_name.trim()) {
        const matMatch = this.materialMap.get(material_name.toLowerCase().trim());
        if (matMatch) {
          mat_uuid = matMatch.mat_uuid;
          gmat_uuid = matMatch.gmat_uuid;
        } else {
          errors.push(`El material "${material_name}" no existe en la tienda.`);
        }
      }

      if (!existingProduct && !previousBatchProduct) {
        if (!item_name.trim()) {
          errors.push('El Rubro es obligatorio para productos nuevos.');
        } else {
          const itemMatch = this.itemMap.get(item_name.toLowerCase().trim());
          if (itemMatch) {
            itm_uuid = itemMatch.itm_uuid;
            
            if (!category_name.trim()) {
              errors.push('La Categoría es obligatoria para productos nuevos.');
            } else {
              const compositeKey = `${itm_uuid}_${category_name.toLowerCase().trim()}`;
              const catMatch = this.categoryMap.get(compositeKey);
              if (catMatch) {
                cat_uuid = catMatch.cat_uuid;
              } else {
                errors.push(`La categoría "${category_name}" no existe bajo el rubro "${item_name}".`);
              }
            }
          } else {
            errors.push(`El rubro "${item_name}" no existe en la tienda.`);
            if (category_name.trim()) {
              errors.push(`La categoría "${category_name}" no se puede validar porque el rubro no existe.`);
            }
          }
        }
      }

      const skuRegisteredInOtherProduct = this.productsSubject$.value.some(p => 
        p.pro_code.toLowerCase().trim() !== pro_code.toLowerCase().trim() &&
        (p.productVariations || []).some(v => v.prov_sku.toLowerCase().trim() === prov_sku.toLowerCase().trim())
      );

      if (skuRegisteredInOtherProduct) {
        errors.push(`El SKU "${prov_sku}" ya está registrado en otro producto.`);
      }

      results.push({
        rowNumber: i + 1,
        pro_code,
        pro_name,
        pro_description,
        item_name,
        category_name,
        cat_uuid,
        itm_uuid,
        prov_sku,
        prov_name,
        material_name,
        mat_uuid,
        gmat_uuid,
        prov_color,
        prov_size,
        price: priceVal,
        stock: stockVal,
        pro_image,
        isExistingMaster,
        isExistingVariation,
        previousStock,
        errors,
        warnings
      });
    }

    this.parsedProducts = results;
    
    const totalErrors = this.parsedProducts.reduce((sum, p) => sum + p.errors.length, 0);
    this.importStep = 2;
    if (totalErrors > 0) {
      this._messageService.warning('Validación Finalizada', `Se encontraron ${totalErrors} observaciones. Por favor, revísalas en la tabla.`);
    } else {
      this._messageService.success('Validación Exitosa', 'Todos los productos son válidos y listos para importar.');
    }
  }

  public get hasErrors(): boolean {
    return this.parsedProducts.some(p => p.errors && p.errors.length > 0);
  }

  public getMissingItems(): string[] {
    const missing = new Set<string>();
    this.parsedProducts.forEach(p => {
      if (p.errors) {
        p.errors.forEach((err: string) => {
          if (err.includes('no existe en la tienda') && err.startsWith('El rubro') && p.item_name) {
            missing.add(p.item_name);
          }
        });
      }
    });
    return Array.from(missing);
  }

  public createMissingItem(itemName: string): void {
    const gitm_uuid = this.missingItemMappings[itemName];
    if (!gitm_uuid) return;

    this.isCreatingItem[itemName] = true;

    const payload = {
      cmp_uuid: this.activeCompanyUuid,
      gitm_uuid: gitm_uuid,
      itm_name: itemName,
      itm_description: `Creado desde la importación masiva`
    };

    this._itemsService.saveItem(payload).subscribe({
      next: (res: any) => {
        this._messageService.success('Rubro Creado', `El rubro "${itemName}" ha sido creado exitosamente.`);
        this.isCreatingItem[itemName] = false;
        
        delete this.missingItemMappings[itemName];
        delete this.isCreatingItem[itemName];
        
        this.preloadCategoriesAndRevalidate();
      },
      error: (err: any) => {
        console.error('Error creating item', err);
        this._messageService.error('Error', err.error?.error || `No se pudo crear el rubro "${itemName}".`);
        this.isCreatingItem[itemName] = false;
      }
    });
  }

  public getMissingCategories(): { catName: string, itmName: string }[] {
    const missing = new Map<string, { catName: string, itmName: string }>();
    this.parsedProducts.forEach(p => {
      if (p.errors) {
        p.errors.forEach((err: string) => {
          if (err.includes('no existe bajo el rubro') && p.category_name && p.item_name) {
            const key = `${p.item_name}_${p.category_name}`;
            missing.set(key, { catName: p.category_name, itmName: p.item_name });
          }
        });
      }
    });
    return Array.from(missing.values());
  }

  public createMissingCategory(catName: string, itmName: string): void {
    const gcat_uuid = this.missingCategoryMappings[catName];
    if (!gcat_uuid) return;

    const itemMatch = this.itemMap.get(itmName.toLowerCase().trim());
    if (!itemMatch) {
      this._messageService.error('Error', `No se encontró el rubro local "${itmName}". Por favor créalo primero.`);
      return;
    }

    this.isCreatingCategory[catName] = true;

    const payload = {
      cmp_uuid: this.activeCompanyUuid,
      itm_uuid: itemMatch.itm_uuid,
      gcat_uuid: gcat_uuid,
      gitm_uuid: itemMatch.gitm_uuid,
      cat_name: catName,
      cat_description: `Creada desde la importación masiva`
    };

    this._categoriesService.saveCategory(payload).subscribe({
      next: (res: any) => {
        this._messageService.success('Categoría Creada', `La categoría "${catName}" ha sido creada exitosamente.`);
        this.isCreatingCategory[catName] = false;
        
        delete this.missingCategoryMappings[catName];
        delete this.isCreatingCategory[catName];
        
        this.preloadCategoriesAndRevalidate();
      },
      error: (err: any) => {
        console.error('Error creating category', err);
        this._messageService.error('Error', err.error?.error || `No se pudo crear la categoría "${catName}".`);
        this.isCreatingCategory[catName] = false;
      }
    });
  }

  private preloadCategoriesAndRevalidate(): void {
    this.categoryMap.clear();
    this.itemMap.clear();
    this.materialMap.clear();
    this.shopItems = [];
    this.shopMaterials = [];

    // Preload materials first
    this._materialsService.getMaterials(this.activeCompanyUuid).subscribe({
      next: (res: any) => {
        const materials = res.data || [];
        this.shopMaterials = materials;
        materials.forEach((mat: any) => {
          const matNameKey = mat.mat_name.toLowerCase().trim();
          this.materialMap.set(matNameKey, {
            mat_uuid: mat.mat_uuid,
            gmat_uuid: mat.gmat_uuid
          });
        });
        console.log('Materials preloaded for bulk import:', this.materialMap.size);

        // Continue with items and categories
        this.revalidateItemsAndCategories();
      },
      error: (err) => {
        console.error('Error loading materials', err);
        this.revalidateItemsAndCategories();
      }
    });
  }

  private revalidateItemsAndCategories(): void {
    this._itemsService.getItems(this.activeCompanyUuid).subscribe({
      next: (res: any) => {
        const items = res.data || [];
        this.shopItems = items;
        items.forEach((itm: any) => {
          const itemNameKey = itm.itm_name.toLowerCase().trim();
          this.itemMap.set(itemNameKey, {
            itm_uuid: itm.itm_uuid,
            gitm_uuid: itm.gitm_uuid
          });
        });
        if (items.length === 0) {
          this.parseAndValidateData();
          return;
        }

        const categoryRequests: Observable<any>[] = items.map((itm: any) => 
          this._categoriesService.getCategories(this.activeCompanyUuid, itm.itm_uuid).pipe(
            map((cRes: any) => ({ itm_uuid: itm.itm_uuid, categories: cRes.data || [] }))
          )
        );

        forkJoin(categoryRequests).subscribe({
          next: (results: any) => {
            results.forEach((resGroup: any) => {
              resGroup.categories.forEach((cat: any) => {
                const nameKey = (cat.cat_name || cat.gcat_name || '').toLowerCase().trim();
                const compositeKey = `${resGroup.itm_uuid}_${nameKey}`;
                this.categoryMap.set(compositeKey, { 
                  cat_uuid: cat.cat_uuid, 
                  itm_uuid: resGroup.itm_uuid 
                });
              });
            });
            console.log('Categories preloaded for bulk import:', this.categoryMap.size);
            this.parseAndValidateData();
          },
          error: (err) => {
            console.error('Error preloading categories for bulk import', err);
            this.parseAndValidateData();
          }
        });
      },
      error: (err) => {
        console.error('Error loading items for bulk import preloading', err);
        this.parseAndValidateData();
      }
    });
  }

  public getMissingMaterials(): string[] {
    const missing = new Set<string>();
    this.parsedProducts.forEach(p => {
      if (p.errors) {
        p.errors.forEach((err: string) => {
          if (err.includes('no existe en la tienda') && err.startsWith('El material') && p.material_name) {
            missing.add(p.material_name);
          }
        });
      }
    });
    return Array.from(missing);
  }

  public createMissingMaterial(materialName: string): void {
    const gmat_uuid = this.missingMaterialMappings[materialName];
    if (!gmat_uuid) return;

    this.isCreatingMaterial[materialName] = true;

    const payload = {
      cmp_uuid: this.activeCompanyUuid,
      gmat_uuid: gmat_uuid,
      mat_name: materialName,
      mat_description: `Creado desde la importación masiva`
    };

    this._materialsService.saveMaterial(payload).subscribe({
      next: (res: any) => {
        this._messageService.success('Material Creado', `El material "${materialName}" ha sido creado exitosamente.`);
        this.isCreatingMaterial[materialName] = false;
        
        delete this.missingMaterialMappings[materialName];
        delete this.isCreatingMaterial[materialName];
        
        this.preloadCategoriesAndRevalidate();
      },
      error: (err: any) => {
        console.error('Error creating material', err);
        this._messageService.error('Error', err.error?.error || `No se pudo crear el material "${materialName}".`);
        this.isCreatingMaterial[materialName] = false;
      }
    });
  }

  public startImport(): void {
    if (this.parsedProducts.length === 0 || this.isImporting) return;
    
    const errorsCount = this.parsedProducts.reduce((sum, p) => sum + p.errors.length, 0);
    if (errorsCount > 0) {
      this._messageService.error('Error', 'No se puede importar. Corrija los errores marcados en rojo.');
      return;
    }

    this.isImporting = true;
    this.importStep = 3;
    this.importProgress = 10;
    this.importLog = ['Iniciando importación masiva en lote...', `Total de filas a procesar: ${this.parsedProducts.length}`];

    // Agrupar filas por producto maestro (pro_code)
    const groupedMap = new Map<string, any[]>();
    this.parsedProducts.forEach(item => {
      if (!groupedMap.has(item.pro_code)) {
        groupedMap.set(item.pro_code, []);
      }
      groupedMap.get(item.pro_code)!.push(item);
    });

    const productsPayloads: any[] = [];
    const productsToProcess = Array.from(groupedMap.entries());

    productsToProcess.forEach(([proCode, variants]) => {
      const baseProductInfo = variants[0];
      const existingProduct = this.productsSubject$.value.find(p => 
        p.pro_code.toLowerCase().trim() === proCode.toLowerCase().trim()
      );

      if (existingProduct) {
        // ACTUALIZAR PRODUCTO EXISTENTE
        const updatedVariations = [...(existingProduct.productVariations || [])];
        const stockMovements: any[] = [];

        variants.forEach(v => {
          const existingVarIndex = updatedVariations.findIndex(ev => 
            ev.prov_sku.toLowerCase().trim() === v.prov_sku.toLowerCase().trim()
          );

          if (existingVarIndex > -1) {
            const ev = updatedVariations[existingVarIndex];
            const previousStock = ev.prov_stock || 0;
            const newStock = v.stock;
            const delta = newStock - previousStock;

            ev.prov_suggestedminimumsellingprice = v.price;
            ev.prov_stock = newStock;
            ev.mat_uuid = v.mat_uuid || ev.mat_uuid || null;
            ev.gmat_uuid = v.gmat_uuid || ev.gmat_uuid || null;
            ev.prov_color = v.prov_color || ev.prov_color || '';
            ev.prov_size = v.prov_size || ev.prov_size || '';

            if (delta !== 0) {
              stockMovements.push({
                prov_sku: ev.prov_sku,
                prov_uuid: ev.prov_uuid,
                quantity: Math.abs(delta),
                previousStock: previousStock,
                currentStock: newStock,
                type: delta > 0 ? 'IN' : 'OUT',
                reason: 'Ajuste por importación masiva'
              });
            }
          } else {
            updatedVariations.push({
              cmp_uuid: this.activeCompanyUuid,
              pro_uuid: existingProduct.pro_uuid,
              prov_code: v.prov_sku,
              prov_sku: v.prov_sku,
              prov_name: v.prov_name,
              prov_description: `${existingProduct.pro_name} - ${v.prov_name}`,
              prov_color: v.prov_color || '',
              prov_size: v.prov_size || '',
              prov_stock: v.stock,
              prov_suggestedminimumsellingprice: v.price,
              mat_uuid: v.mat_uuid || null,
              gmat_uuid: v.gmat_uuid || null
            } as any);

            if (v.stock > 0) {
              stockMovements.push({
                prov_sku: v.prov_sku,
                prov_uuid: null,
                quantity: v.stock,
                previousStock: 0,
                currentStock: v.stock,
                type: 'IN',
                reason: 'Carga masiva de inventario'
              });
            }
          }
        });

        productsPayloads.push({
          action: 'update',
          cmp_uuid: this.activeCompanyUuid,
          pro_uuid: existingProduct.pro_uuid,
          pro_code: existingProduct.pro_code,
          pro_name: baseProductInfo.pro_name,
          pro_description: baseProductInfo.pro_description,
          pro_image: baseProductInfo.pro_image || existingProduct.pro_image || `https://api.dicebear.com/7.x/shapes/svg?seed=${baseProductInfo.pro_name}`,
          itm_uuid: baseProductInfo.itm_uuid,
          cat_uuid: baseProductInfo.cat_uuid,
          productVariations: updatedVariations,
          stockMovements
        });
      } else {
        // CREAR PRODUCTO MAESTRO NUEVO
        productsPayloads.push({
          action: 'create',
          cmp_uuid: this.activeCompanyUuid,
          pro_code: baseProductInfo.pro_code,
          pro_name: baseProductInfo.pro_name,
          pro_description: baseProductInfo.pro_description,
          pro_image: baseProductInfo.pro_image || `https://api.dicebear.com/7.x/shapes/svg?seed=${baseProductInfo.pro_name}`,
          itm_uuid: baseProductInfo.itm_uuid,
          cat_uuid: baseProductInfo.cat_uuid,
          productVariations: variants.map(v => ({
            cmp_uuid: this.activeCompanyUuid,
            prov_code: v.prov_sku,
            prov_sku: v.prov_sku,
            prov_name: v.prov_name,
            prov_description: `${baseProductInfo.pro_name} - ${v.prov_name}`,
            prov_color: v.prov_color || '',
            prov_size: v.prov_size || '',
            prov_stock: v.stock,
            prov_suggestedminimumsellingprice: v.price,
            mat_uuid: v.mat_uuid || null,
            gmat_uuid: v.gmat_uuid || null
          }))
        });
      }
    });

    this.importLog.push('Enviando datos al servidor...');
    this.importProgress = 40;

    this._productService.saveProductsBulk(productsPayloads).subscribe({
      next: (response: any) => {
        this.importProgress = 80;
        let successCount = 0;
        let errorCount = 0;

        if (response.success && Array.isArray(response.data)) {
          response.data.forEach((res: any) => {
            if (res.success) {
              successCount++;
              this.importLog.push(`✓ Procesado correctamente: Código ${res.pro_code}`);
            } else {
              errorCount++;
              this.importLog.push(`✗ Error en Código ${res.pro_code}: ${res.error || 'Fallo desconocido'}`);
            }
          });

          this.importProgress = 100;
          this.importLog.push('=== IMPORTACIÓN COMPLETADA ===');
          this.importLog.push(`Se procesaron correctamente ${successCount} productos.`);
          if (errorCount > 0) {
            this.importLog.push(`⚠️ Hubo ${errorCount} productos con errores. Revise la lista.`);
            this._messageService.warning('Carga Masiva', `Se cargaron ${successCount} productos con éxito, pero ${errorCount} fallaron.`);
          } else {
            this._messageService.success('Carga Masiva Exitosa', `Se procesaron ${successCount} productos.`);
          }
        } else {
          this.importLog.push(`✗ Error del servidor: ${response.message || 'Respuesta inválida'}`);
          this._messageService.error('Error', response.message || 'Error desconocido al procesar el lote.');
        }

        this.isImporting = false;
        this.getProducts(this.activeCompanyUuid);
      },
      error: (err: any) => {
        console.error('Error al guardar productos en importación masiva', err);
        this.importLog.push(`✗ Error crítico: ${err.error?.error || err.message || 'Fallo de conexión'}`);
        this.isImporting = false;
        this._messageService.error('Error de Conexión', 'Ocurrió un error al enviar el lote de productos.');
      }
    });
  }
}

