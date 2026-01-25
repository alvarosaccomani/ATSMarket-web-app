import { Component, OnInit } from '@angular/core';
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
    NzButtonModule
  ],
  templateUrl: './product-variation.component.html',
  styleUrl: './product-variation.component.scss'
})
export class ProductVariationComponent implements OnInit {

  public detailForm!: FormGroup;
  public suppliersList = [{ uuid: '1', name: 'Artesanías Luján' }, { uuid: '2', name: 'Importaciones Sacra' }];
  public fileList: NzUploadFile[] = [];

  public finalPriceValue: number = 0;
  public currentCostValue: number = 0;
  public currentCostSelected: boolean = false;

  constructor(private fb: FormBuilder, private location: Location) { }

  ngOnInit(): void {
    this.detailForm = this.fb.group({
      prov_sku: [{ value: 'ROS-PL-L', disabled: true }],
      prov_name: ['', Validators.required],
      prov_description: [''],
      markup_percentage: [50, [Validators.required]], // Ganancia global de la variación
      costsPerSupplier: this.fb.array([])
    });

    // Escuchar cambios en todo el formulario para recalcular el precio
    this.detailForm.valueChanges.subscribe(() => this.calculateProfitability());

    // Simular carga de datos inicial si fuera necesario
    this.addSupplier();
  }

  get suppliersArray(): FormArray {
    return this.detailForm.get('costsPerSupplier') as FormArray;
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
    const markup = this.detailForm.get('markup_percentage')?.value || 0;
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
