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
import { ProductVariationsService } from '@services/product-variations.service';

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
    NzToolTipModule
  ],
  templateUrl: './product-variation.component.html',
  styleUrl: './product-variation.component.scss'
})
export class ProductVariationComponent implements OnInit {

  public productVariationForm!: FormGroup;
  public suppliersList = [{ uuid: '1', name: 'Artesanías Luján' }, { uuid: '2', name: 'Importaciones Sacra' }];
  public fileList: NzUploadFile[] = [];

  public finalPriceValue: number = 0;
  public currentCostValue: number = 0;
  public currentCostSelected: boolean = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private _route: ActivatedRoute,
    private _productVariationsService: ProductVariationsService
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

    this.productVariationForm.patchValue({
      cmp_uuid: '28a0036e-2d6b-4e83-805a-1ca214a6b1e1'
    });

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

  get suppliersArray(): FormArray {
    return this.productVariationForm.get('costsPerSupplier') as FormArray;
  }

  private getProductVariationById(cmp_uuid: string, pro_uuid: string, prov_uuid: string): void {
    this._productVariationsService.getProductVariationById(cmp_uuid, pro_uuid, prov_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          const productVariationData = response.data;
          this.productVariationForm.patchValue({
            cmp_uuid: productVariationData.cmp_uuid,
            pro_uuid: productVariationData.pro_uuid,
            prov_uuid: productVariationData.prov_uuid,
            prov_sku: productVariationData.prov_sku,
            prov_name: productVariationData.prov_name,
            prov_description: productVariationData.prov_description,
            markup_percentage: productVariationData.markup_percentag || 50,
            costsPerSupplier: this.fb.array([])
          });

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

  public addSupplier(): void {
    const group = this.fb.group({
      sup_Uuid: [null, Validators.required],
      cpsup_PriceCost: [0, Validators.required],
      cpsup_Stock: [0],
      cpsup_IsCurrentCost: [this.suppliersArray.length === 0] // El primero es actual por defecto
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
      if (i !== index) control.get('cpsup_IsCurrentCost')?.setValue(false, { emitEvent: false });
    });
    this.calculateProfitability();
  }

  public calculateProfitability(): void {
    const markup = this.productVariationForm.get('markup_percentage')?.value || 0;
    // Buscamos el proveedor que tenga el switch de 'isCurrentCost' en true
    const currentSupplier = this.suppliersArray.controls.find((c: any) => c.get('cpsup_IsCurrentCost')?.value === true);

    if (currentSupplier) {
      this.currentCostSelected = true;
      this.currentCostValue = currentSupplier.get('cpsup_PriceCost')?.value || 0;
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
    /* ... enviamos a la API y volvemos con location.back() ... */
  }

  public onCancel(): void {
    this.location.back();
  }

}
