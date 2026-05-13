import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { ProductVariationsService } from '@services/product-variations.service';
import { SessionService } from '@services/session.service';
import { SuppliersService } from '@services/suppliers.service';
import { MessageService } from '@services/message.service';
import { SupplierInterface } from '@interfaces/supplier';
import { CurrencyInterface } from '@interfaces/currency';
import { CurrenciesService } from '@services/currencies.service';

@Component({
  selector: 'app-product-variation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    NzDatePickerModule
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

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private _route: ActivatedRoute,
    private _sessionService: SessionService,
    private _suppliersService: SuppliersService,
    private _productVariationsService: ProductVariationsService,
    private _currenciesService: CurrenciesService,
    private _messageService: MessageService
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
        this.getProductVariationById(this.productVariationForm.value.cmp_uuid!, this.productVariationForm.value.pro_uuid!, this.productVariationForm.value.prov_uuid!);
      } else {

      }
    });
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

      this._productVariationsService.updateProductVariation(formData).subscribe(
        (response: any) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              "Éxito",
              "La variante ha sido actualizada correctamente.",
              () => {
                this.location.back();
              }
            );
          } else {
            this._messageService.error("Error", "No se pudo actualizar la variante.");
          }
        },
        (error: any) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error("Error", "Ocurrió un error al intentar guardar los cambios.");
        }
      );
    } else {
      this._messageService.warning("Formulario Inválido", "Por favor completa todos los campos requeridos.");
    }
  }

  public onCancel(): void {
    this.location.back();
  }

}
