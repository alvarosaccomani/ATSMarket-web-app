import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { StockMovementInterface } from '@interfaces/stock-movement/stock-movement.interface';
import { ProductInterface } from '@interfaces/product';
import { ProductVariationInterface } from '@interfaces/product-variation';
import { SessionService } from '@services/session.service';
import { StockMovementsService } from '@services/stock-movements.service';
import { ProductsService } from '@services/products.service';
import { MessageService } from '@services/message.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzSelectModule,
    NzInputModule,
    NzEmptyModule,
    NzAvatarModule,
    NzModalModule,
    NzFormModule,
    NzInputNumberModule,
    NzToolTipModule
  ],
  templateUrl: './inventory-audit.component.html',
  styleUrl: './inventory-audit.component.scss'
})
export class InventoryAuditComponent implements OnInit {

  public isLoading: boolean = true;
  public allMovements: StockMovementInterface[] = [];
  public filteredMovements: StockMovementInterface[] = [];
  
  // Catálogo completo para KPI de valoración y listados
  public productsList: ProductInterface[] = [];
  public allVariationsMap: { [prov_uuid: string]: { prov: ProductVariationInterface; pro: ProductInterface } } = {};

  // Variables de sesión
  public activeCmpUuid: string = '';
  public activeCmpName: string = '';

  // Filtros
  public searchTerm: string = '';
  public selectedTypeFilter: string = 'ALL';

  // KPIs
  public totalStockValue: number = 0;
  public totalInUnits: number = 0;
  public totalOutUnits: number = 0;
  public totalAdjustmentsCount: number = 0;

  // Ajuste Manual Modal
  public isAdjustmentModalVisible: boolean = false;
  public isSavingAdjustment: boolean = false;
  public isLoadingVariations: boolean = false;
  public adjustmentForm!: FormGroup;
  public selectedProductVariations: ProductVariationInterface[] = [];

  constructor(
    private fb: FormBuilder,
    private _sessionService: SessionService,
    private _stockMovementsService: StockMovementsService,
    private _productsService: ProductsService,
    private _messageService: MessageService,
    private _productVariationsService: ProductVariationsService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.activeCmpUuid = company.cmp_uuid;
      this.activeCmpName = company.cmp_name || 'Mi Comercio';
      
      this.initForm();
      this.loadData();
    } else {
      this.isLoading = false;
    }
  }

  private initForm(): void {
    this.adjustmentForm = this.fb.group({
      pro_uuid: ['', Validators.required],
      prov_uuid: ['', Validators.required],
      tsmo_uuid: ['ADJUSTMENT', Validators.required],
      smo_quantity: [1, [Validators.required, Validators.min(1)]],
      smo_reason: ['', [Validators.required, Validators.maxLength(150)]]
    });

    // Escuchar cambios en el producto seleccionado en el modal
    this.adjustmentForm.get('pro_uuid')?.valueChanges.subscribe(proUuid => {
      this.adjustmentForm.patchValue({ prov_uuid: '' });
      if (proUuid) {
        this.isLoadingVariations = true;
        this._productVariationsService.getProductsVariations(this.activeCmpUuid, proUuid).subscribe({
          next: (res) => {
            const list = res.data || [];
            this.selectedProductVariations = list.filter(v => v.pro_uuid === proUuid);
            this.isLoadingVariations = false;
          },
          error: (err) => {
            console.error('Error al cargar variaciones de producto:', err);
            this.selectedProductVariations = [];
            this.isLoadingVariations = false;
          }
        });
      } else {
        this.selectedProductVariations = [];
      }
    });
  }

  public loadData(): void {
    this.isLoading = true;

    forkJoin({
      movementsRes: this._stockMovementsService.getStockMovements(this.activeCmpUuid).pipe(
        catchError(() => of({ success: true, data: [] as StockMovementInterface[] }))
      ),
      productsRes: this._productsService.getProducts(this.activeCmpUuid).pipe(
        catchError(() => of({ data: [] as ProductInterface[] }))
      )
    }).subscribe({
      next: ({ movementsRes, productsRes }) => {
        this.productsList = productsRes?.data || [];
        this.allMovements = movementsRes?.data || [];

        // Mapear variaciones en un mapa rápido para recuperaciones O(1)
        this.allVariationsMap = {};
        this.productsList.forEach(p => {
          (p.productVariations || []).forEach(v => {
            this.allVariationsMap[v.prov_uuid] = { prov: v, pro: p };
          });
        });

        this.computeKPIs();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos de auditoría de stock:', err);
        this.isLoading = false;
        this._messageService.error('Error', 'No se pudieron recuperar los movimientos de stock.');
      }
    });
  }

  private computeKPIs(): void {
    // 1. Valoración de inventario sumado en base a stock físico real x precio sugerido
    let totalVal = 0;
    this.productsList.forEach(p => {
      (p.productVariations || []).forEach(v => {
        totalVal += (v.prov_stock || 0) * (v.prov_suggestedminimumsellingprice || 0);
      });
    });
    this.totalStockValue = totalVal;

    // 2. Sumas acumuladas de ingresos, egresos y ajustes
    let inUnits = 0;
    let outUnits = 0;
    let adjustments = 0;

    this.allMovements.forEach(m => {
      if (m.tsmo_uuid === 'IN') {
        inUnits += m.smo_quantity;
      } else if (m.tsmo_uuid === 'OUT') {
        outUnits += m.smo_quantity;
      } else if (m.tsmo_uuid === 'ADJUSTMENT') {
        adjustments++;
      }
    });

    this.totalInUnits = inUnits;
    this.totalOutUnits = outUnits;
    this.totalAdjustmentsCount = adjustments;
  }

  public applyFilters(): void {
    let result = [...this.allMovements];

    // Filtro por tipo de movimiento
    if (this.selectedTypeFilter !== 'ALL') {
      result = result.filter(m => m.tsmo_uuid === this.selectedTypeFilter);
    }

    // Filtro por término de búsqueda (Producto, SKU, o motivo)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m => {
        const item = this.allVariationsMap[m.prov_uuid];
        const prodName = item?.pro?.pro_name || '';
        const varName = item?.prov?.prov_name || '';
        const sku = item?.prov?.prov_sku || '';
        const code = item?.prov?.prov_code || '';
        const reason = m.smo_reason || '';

        return prodName.toLowerCase().includes(term) ||
               varName.toLowerCase().includes(term) ||
               sku.toLowerCase().includes(term) ||
               code.toLowerCase().includes(term) ||
               reason.toLowerCase().includes(term);
      });
    }

    this.filteredMovements = result;
  }

  // --- MODAL DE AJUSTE MANUAL ---

  public openAdjustmentModal(): void {
    this.adjustmentForm.reset({
      pro_uuid: '',
      prov_uuid: '',
      tsmo_uuid: 'ADJUSTMENT',
      smo_quantity: 1,
      smo_reason: ''
    });
    this.selectedProductVariations = [];
    this.isAdjustmentModalVisible = true;
  }

  public closeAdjustmentModal(): void {
    this.isAdjustmentModalVisible = false;
  }

  public onSaveAdjustment(): void {
    if (this.adjustmentForm.invalid) {
      Object.keys(this.adjustmentForm.controls).forEach(key => {
        this.adjustmentForm.get(key)?.markAsDirty();
        this.adjustmentForm.get(key)?.updateValueAndValidity();
      });
      return;
    }

    this.isSavingAdjustment = true;
    const formVal = this.adjustmentForm.value;

    // Obtener la variación para calcular el stock previo y resultante
    const variationItem = this.allVariationsMap[formVal.prov_uuid];
    if (!variationItem) {
      this._messageService.error('Error', 'No se encontró la variación seleccionada.');
      this.isSavingAdjustment = false;
      return;
    }

    const previousStock = variationItem.prov.prov_stock || 0;
    
    // Determinar cantidad con signo relativo
    let delta = formVal.smo_quantity;
    if (formVal.tsmo_uuid === 'OUT' || (formVal.tsmo_uuid === 'ADJUSTMENT' && formVal.smo_reason.toLowerCase().includes('rotura') || formVal.smo_reason.toLowerCase().includes('daño') || formVal.smo_reason.toLowerCase().includes('perdida'))) {
      delta = -Math.abs(formVal.smo_quantity);
    }
    const currentStock = previousStock + delta;

    const payload: Partial<StockMovementInterface> = {
      cmp_uuid: this.activeCmpUuid,
      pro_uuid: formVal.pro_uuid,
      prov_uuid: formVal.prov_uuid,
      usr_uuid: this._sessionService.getIdentity()?.usr_uuid || null,
      ord_uuid: null,
      tsmo_uuid: formVal.tsmo_uuid,
      smo_quantity: formVal.smo_quantity,
      smo_previousstock: previousStock,
      smo_currentstock: currentStock,
      smo_reason: formVal.smo_reason
    };

    this._stockMovementsService.saveStockMovement(payload).subscribe({
      next: (res) => {
        this.isSavingAdjustment = false;
        this.isAdjustmentModalVisible = false;

        // Modificar stock en local de forma simulada para actualizar la vista de forma reactiva e instantánea
        variationItem.prov.prov_stock = currentStock;

        this._messageService.success('Ajuste Registrado', 'El movimiento de inventario fue guardado y el stock actualizado.');
        this.loadData(); // Recargar bitácora y recalcular KPIs
      },
      error: (err) => {
        console.error('Error al guardar movimiento de stock:', err);
        this.isSavingAdjustment = false;
        this._messageService.error('Error', 'Ocurrió un inconveniente al guardar el movimiento en el servidor.');
      }
    });
  }

  // --- VISUAL FORMATTING HELPERS ---

  public getProductName(prov_uuid: string): string {
    return this.allVariationsMap[prov_uuid]?.pro?.pro_name || 'Producto';
  }

  public getVariationName(prov_uuid: string): string {
    return this.allVariationsMap[prov_uuid]?.prov?.prov_name || 'Variación';
  }

  public getVariationSku(prov_uuid: string): string {
    return this.allVariationsMap[prov_uuid]?.prov?.prov_sku || 'SKU';
  }

  public getProductAvatar(prov_uuid: string): string {
    const item = this.allVariationsMap[prov_uuid];
    return item?.pro?.pro_image || `https://api.dicebear.com/7.x/shapes/svg?seed=${item?.pro?.pro_name || 'inv'}`;
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
      case 'OUT': return 'Egreso';
      case 'ADJUSTMENT': return 'Ajuste';
      default: return 'Otro';
    }
  }

  public getMovementIcon(type: string): string {
    switch (type) {
      case 'IN': return 'arrow-down';
      case 'OUT': return 'arrow-up';
      case 'ADJUSTMENT': return 'swap';
      default: return 'question';
    }
  }
}
