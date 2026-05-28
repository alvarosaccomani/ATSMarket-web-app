import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProductVariationsService } from '@services/product-variations.service';
import { SessionService } from '@services/session.service';
import { SuppliersService } from '@services/suppliers.service';
import { MessageService } from '@services/message.service';
import { SupplierInterface } from '@interfaces/supplier';
import { CurrencyInterface } from '@interfaces/currency';
import { CurrenciesService } from '@services/currencies.service';
import { WarehousesService } from '@services/warehouses.service';
import { WarehousesLocationsService } from '@services/warehouses-locations.service';
import { InventoryStocksService } from '@services/inventory-stocks.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-variation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzDividerModule,
    NzUploadModule,
    NzTabsModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzFormModule,
    NzCardModule,
    NzSelectModule,
    NzTableModule,
    NzButtonModule,
    NzSpaceModule,
    NzToolTipModule,
    NzDatePickerModule,
    NzEmptyModule,
    NzSpinModule,
    NzIconModule
  ],
  templateUrl: './product-variation.component.html',
  styleUrl: './product-variation.component.scss'
})
export class ProductVariationComponent implements OnInit {

  public productVariationForm!: FormGroup;
  public suppliersList: SupplierInterface[] = [];
  public currenciesList: CurrencyInterface[] = [];
  public fileList: NzUploadFile[] = [];
  public currentCmpUuid: string = '';
  public isLoading: boolean = false;

  public finalPriceValue: number = 0;
  public currentCostValue: number = 0;
  public currentCostSelected: boolean = false;

  public warehouseStocksList: any[] = [];
  public allCompanyWarehouses: any[] = [];
  public originalWarehouseStocks: any[] = [];
  public isLoadingStocks: boolean = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private _route: ActivatedRoute,
    private _sessionService: SessionService,
    private _suppliersService: SuppliersService,
    private _productVariationsService: ProductVariationsService,
    private _currenciesService: CurrenciesService,
    private _messageService: MessageService,
    private _warehousesService: WarehousesService,
    private _warehousesLocationsService: WarehousesLocationsService,
    private _inventoryStocksService: InventoryStocksService
  ) { }

  ngOnInit(): void {
    this.productVariationForm = this.fb.group({
      // Datos de prov_Products
      cmp_uuid: [''],
      pro_uuid: [''],
      prov_uuid: [''],
      prov_sku: [{ value: 'ROS-PL-L', disabled: true }],
      prov_name: ['', Validators.required],
      prov_description: [''],
      markup_percentage: [50, [Validators.required]], // Ganancia global de la variación
      costsPerSupplier: this.fb.array([])
    });

    const company = this._sessionService.getCompany();
    this.currentCmpUuid = company.cmp_uuid;

    this.productVariationForm.patchValue({
      cmp_uuid: this.currentCmpUuid
    });

    this.loadSuppliers(this.currentCmpUuid);
    this.loadCurrencies();

    // Escuchar cambios en todo el formulario para recalcular el precio
    this.productVariationForm.valueChanges.subscribe(() => this.calculateProfitability());

    // Simular carga de datos inicial si fuera necesario
    this.addSupplier();

    this._route.params.subscribe((params) => {
      if (params['pro_uuid'] && params['pro_uuid'] != 'new' && params['prov_uuid'] && params['prov_uuid'] != 'new') {
        this.productVariationForm.patchValue({
          pro_uuid: params['pro_uuid'],
          prov_uuid: params['prov_uuid']
        });
        const proUuid = params['pro_uuid'];
        const provUuid = params['prov_uuid'];
        this.getProductVariationById(this.productVariationForm.value.cmp_uuid!, this.productVariationForm.value.pro_uuid!, provUuid);
      } else {

      }
    });
  }

  private loadWarehouseStocks(proUuid: string, provUuid: string, preloadedStocks?: any[]): void {
    this.isLoadingStocks = true;
    this._warehousesService.getWarehouses(this.currentCmpUuid).subscribe({
      next: (res) => {
        this.allCompanyWarehouses = res.data || [];
        if (this.allCompanyWarehouses.length === 0) {
          this.isLoadingStocks = false;
          return;
        }

        const handleStocksList = (stocks: any[]) => {
          this.originalWarehouseStocks = stocks; // Guardar estado original de la base de datos para sumas condicionales
          
          if (stocks && stocks.length > 0) {
            // Filtrar depósitos únicos para cargar sus coordenadas
            const uniqueWarUuids = Array.from(new Set(stocks.map(s => s.war_uuid).filter(Boolean))) as string[];
            
            if (uniqueWarUuids.length > 0) {
              const locationRequests = uniqueWarUuids.map((warUuid: string) => 
                this._warehousesLocationsService.getLocations(this.currentCmpUuid, warUuid)
              );

              forkJoin(locationRequests).subscribe({
                next: (locResults: any[]) => {
                  const locationsMap: { [warUuid: string]: any[] } = {};
                  uniqueWarUuids.forEach((warUuid, idx) => {
                    locationsMap[warUuid] = locResults[idx].data || [];
                  });

                  this.warehouseStocksList = stocks.map((s: any) => {
                    const w = this.allCompanyWarehouses.find(x => x.war_uuid === s.war_uuid) || {};
                    return {
                      war_uuid: s.war_uuid,
                      war_name: w.war_name || '',
                      war_address: w.war_address || '',
                      ist_quanty: s.ist_quanty || 0,
                      ist_quantyreserved: s.ist_quantyreserved || 0,
                      warl_uuid: s.warl_uuid || '',
                      availableBins: locationsMap[s.war_uuid] || [],
                      isNewRow: false
                    };
                  });
                  this.isLoadingStocks = false;
                },
                error: (err) => {
                  console.error('Error al cargar coordenadas para stock:', err);
                  this.isLoadingStocks = false;
                }
              });
            } else {
              this.warehouseStocksList = [];
              this.isLoadingStocks = false;
            }
          } else {
            this.warehouseStocksList = [];
            this.isLoadingStocks = false;
          }
        };

        if (preloadedStocks) {
          handleStocksList(preloadedStocks);
        } else {
          // Fallback en caso de que no venga precargado (ej: si se invoca desde otro flujo)
          this._inventoryStocksService.getStocksByVariation(this.currentCmpUuid, proUuid, provUuid).subscribe({
            next: (stockRes) => {
              handleStocksList(stockRes.data || []);
            },
            error: (err) => {
              console.error('Error al cargar stock de la variante:', err);
              this.isLoadingStocks = false;
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar depósitos:', err);
        this.isLoadingStocks = false;
      }
    });
  }

  public addWarehouseStockRow(): void {
    this.warehouseStocksList = [
      ...this.warehouseStocksList,
      {
        war_uuid: '',
        war_name: '',
        war_address: '',
        ist_quanty: 0,
        ist_quantyreserved: 0,
        warl_uuid: '',
        availableBins: [],
        isNewRow: true
      }
    ];
  }

  public removeWarehouseStockRow(index: number): void {
    this.warehouseStocksList.splice(index, 1);
  }

  public getAvailableWarehousesForSelect(currentRowUuid: string): any[] {
    return this.allCompanyWarehouses;
  }

  public onWarehouseSelectChange(item: any, warUuid: string): void {
    const selected = this.allCompanyWarehouses.find(w => w.war_uuid === warUuid);
    if (selected) {
      item.war_name = selected.war_name;
      item.war_address = selected.war_address;
      item.warl_uuid = '';
      item.availableBins = [];

      this._warehousesLocationsService.getLocations(this.currentCmpUuid, warUuid).subscribe({
        next: (res) => {
          item.availableBins = res.data || [];
        },
        error: (err) => {
          console.error('Error al cargar coordenadas del depósito seleccionado:', err);
        }
      });
    }
  }

  private loadSuppliers(cmp_uuid: string): void {
    this._suppliersService.getSuppliers(cmp_uuid).subscribe((res: any) => {
      this.suppliersList = res.data || [];
    });
  }

  private loadCurrencies(): void {
    this._currenciesService.getCurrencies().subscribe((res: any) => {
      this.currenciesList = res.data || [];
    });
  }

  get suppliersArray(): FormArray {
    return this.productVariationForm.get('costsPerSupplier') as FormArray;
  }

  private getProductVariationById(cmp_uuid: string, pro_uuid: string, prov_uuid: string): void {
    this.isLoading = true;
    this._productVariationsService.getProductVariationById(cmp_uuid, pro_uuid, prov_uuid).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.success) {
          const productVariationData = response.data;
          this.productVariationForm.patchValue({
            cmp_uuid: productVariationData.cmp_uuid,
            pro_uuid: productVariationData.pro_uuid,
            prov_uuid: productVariationData.prov_uuid,
            prov_sku: productVariationData.prov_sku,
            prov_name: productVariationData.prov_name,
            prov_description: productVariationData.prov_description,
            markup_percentage: productVariationData.markup_percentage || 50
          });

          // Repoblar costos por proveedor
          const variationsCosts = productVariationData.costsPerSupplier || [];
          const variationsCostsFormArray = this.productVariationForm.get('costsPerSupplier') as FormArray;
          
          while (variationsCostsFormArray.length !== 0) {
            variationsCostsFormArray.removeAt(0);
          }

          variationsCosts.forEach((cost: any) => {
            const group = this.fb.group({
              cmp_uuid: [this.currentCmpUuid],
              pro_uuid: [this.productVariationForm.value.pro_uuid],
              prov_uuid: [this.productVariationForm.value.prov_uuid],
              sup_uuid: [cost.sup_uuid || cost.sup_Uuid, Validators.required],
              cps_uuid: [cost.cps_uuid || cost.cps_Uuid],
              cps_pricecost: [cost.cpsup_pricecost || cost.cpsup_PriceCost || 0, Validators.required],
              cps_basecost: [!!(cost.cpsup_iscurrentcost || cost.cpsup_IsCurrentCost)],
              cur_uuid: [cost.cur_uuid],
              cps_exchangerate: [cost.cps_exchangerate],
              cps_suppliersku: [cost.cps_suppliersku],
              cps_leadtimedays: [cost.cps_leadtimedays],
              cps_miniumorderquanty: [cost.cps_miniumorderquanty],
              cps_boxquantity: [cost.cps_boxquantity],
              cps_notes: [cost.cps_notes],
              cps_suggestedminimumsellingprice: [cost.cps_suggestedminimumsellingprice],
              cps_date: [cost.cps_date]
            });
            variationsCostsFormArray.push(group);
          });

          this.calculateProfitability();

          // Cargar la distribución de stock WMS a partir del array inventoryStock precargado en response
          this.loadWarehouseStocks(productVariationData.pro_uuid, productVariationData.prov_uuid, productVariationData.inventoryStock);

        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  public addSupplier(): void {
    const group = this.fb.group({
      cmp_uuid: [this.currentCmpUuid],
      pro_uuid: [this.productVariationForm.value.pro_uuid],
      prov_uuid: [this.productVariationForm.value.prov_uuid],
      sup_uuid: [null, Validators.required],
      cps_pricecost: [0, Validators.required],
      cps_basecost: [this.suppliersArray.length === 0], // El primero es actual por defecto
      cur_uuid: [null],
      cps_exchangerate: [0],
      cps_suppliersku: [''],
      cps_leadtimedays: [0],
      cps_miniumorderquanty: [0],
      cps_boxquantity: [0],
      cps_notes: [''],
      cps_suggestedminimumsellingprice: [0],
      cps_date: [new Date()]
    });
    this.suppliersArray.push(group);
  }

  public removeSupplier(index: number): void {
    // Esto elimina la fila del FormArray en la posición 'index'
    this.suppliersArray.removeAt(index);

    // Opcional: Recalcular rentabilidad por si eliminaste el "Costo Actual"
    this.calculateProfitability();
  }

  public onCurrentCostChange(index: number): void {
    this.suppliersArray.controls.forEach((control: any, i: number) => {
      if (i !== index) control.get('cps_basecost')?.setValue(false, { emitEvent: false });
    });
    this.calculateProfitability();
  }

  public calculateProfitability(): void {
    const markup = this.productVariationForm.get('markup_percentage')?.value || 0;
    // Buscamos el proveedor que tenga el switch de 'isCurrentCost' en true
    const currentSupplier = this.suppliersArray.controls.find((c: any) => c.get('cps_basecost')?.value === true);

    if (currentSupplier) {
      this.currentCostSelected = true;
      this.currentCostValue = currentSupplier.get('cps_pricecost')?.value || 0;
      this.finalPriceValue = this.currentCostValue * (1 + (markup / 100));
    } else {
      this.currentCostSelected = false;
    }
  }

  // Upload Logic
  public beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = [file];
    return false;
  };

  public formatterPercent = (value: number): string => `${value} %`;

  public onSave(): void {
    if (this.productVariationForm.valid) {
      this.isLoading = true;
      const formData = this.productVariationForm.getRawValue(); // Incluye campos deshabilitados como SKU

      // Guardar también la distribución de stock y casilleros por depósito en paralelo (solo válidos con depósito y casillero asignado)
      const validStocksList = this.warehouseStocksList.filter(item => item.war_uuid && item.warl_uuid);

      // Verificar si hay combinaciones duplicadas de depósito y casillero (WMS coords)
      const seenCombinations = new Set<string>();
      for (const item of validStocksList) {
        const comboKey = `${item.war_uuid}_${item.warl_uuid}`;
        if (seenCombinations.has(comboKey)) {
          this.isLoading = false;
          const warehouseName = item.war_name || 'Seleccionado';
          const binObj = item.availableBins?.find((b: any) => b.warl_uuid === item.warl_uuid);
          const binName = binObj ? (binObj.warl_bincode || binObj.warl_code || item.warl_uuid) : item.warl_uuid;
          
          this._messageService.warning(
            "Combinación Duplicada",
            `El depósito "${warehouseName}" ya tiene una asignación de stock para el casillero "${binName}".`
          );
          return;
        }
        seenCombinations.add(comboKey);
      }

      const stockSaveRequests = validStocksList.map(item => {
        // Buscar si ya existía un registro de stock para este depósito y casillero originalmente en la base de datos
        const preExistingStock = this.originalWarehouseStocks.find(
          x => x.war_uuid === item.war_uuid && x.warl_uuid === item.warl_uuid
        );

        if (item.isNewRow && !preExistingStock) {
          // Si es un renglón totalmente nuevo en la base de datos, registramos inicialmente con POST
          return this._inventoryStocksService.saveWarehouseStock({
            cmp_uuid: this.currentCmpUuid,
            pro_uuid: formData.pro_uuid,
            prov_uuid: formData.prov_uuid,
            war_uuid: item.war_uuid,
            warl_uuid: item.warl_uuid,
            ist_quanty: item.ist_quanty,
            ist_quantyreserved: item.ist_quantyreserved
          });
        } else {
          // Si ya existía registro en la base de datos, actualizamos el saldo mediante PUT.
          // Si es una fila nueva agregada (por ejemplo, tras haber sido eliminada de la lista o como adición),
          // sumamos la nueva cantidad al stock base que ya existía en la base de datos.
          // Si se editó sobre la fila cargada originalmente, respetamos el valor absoluto ingresado.
          const baseQuantity = preExistingStock ? (preExistingStock.ist_quanty || 0) : 0;
          const finalQuantity = item.isNewRow ? (baseQuantity + item.ist_quanty) : item.ist_quanty;

          return this._inventoryStocksService.updateWarehouseStock(
            this.currentCmpUuid,
            formData.pro_uuid,
            formData.prov_uuid,
            item.war_uuid,
            item.warl_uuid,
            finalQuantity,
            item.ist_quantyreserved
          );
        }
      });

      forkJoin([
        this._productVariationsService.updateProductVariation(formData),
        ...stockSaveRequests
      ]).subscribe({
        next: (responses: any[]) => {
          this.isLoading = false;
          this._messageService.success(
            "Éxito",
            "La variante y su distribución de stock en depósitos han sido actualizadas correctamente.",
            () => {
              this.location.back();
            }
          );
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this._messageService.error("Error", "Ocurrió un error al intentar guardar los cambios de la variante o su inventario.");
        }
      });
    } else {
      this._messageService.warning("Formulario Inválido", "Por favor completa todos los campos requeridos.");
    }
  }

  public onCancel(): void {
    this.location.back();
  }

}
