import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ProductsService } from '@services/products.service';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzDividerModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzTableModule,
    NzButtonModule,
    NzInputNumberModule,
    NzSpaceModule,
    NzCardModule,
    NzGridModule,
    NzToolTipModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _productsService: ProductsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      // Datos de pro_Products
      cmp_uuid: [''], // ID de la Tienda seleccionada
      pro_uuid: [''],
      pro_code: ['', Validators.required],
      pro_name: ['', Validators.required],
      pro_description: [''],
      itm_uuid: ['', Validators.required],
      cat_uuid: ['', Validators.required],

      // Arreglo de Variaciones (productVariations)
      productVariations: this.fb.array([])
    });

    this.productForm.patchValue({
      cmp_uuid: '28a0036e-2d6b-4e83-805a-1ca214a6b1e1'
    });

    this._route.params.subscribe((params) => {
      if (params['pro_uuid'] && params['pro_uuid'] != 'new') {
        this.productForm.patchValue({
          pro_uuid: params['pro_uuid']
        });
        this.getProductById(this.productForm.value.cmp_uuid!, this.productForm.value.pro_uuid);
      } else {
        // Agregamos una variación por defecto al inicio
        this.addVariation();
      }
    });
  }

  // Getter para acceder al array de variaciones fácilmente
  get productVariations(): FormArray {
    return this.productForm.get('productVariations') as FormArray;
  }

  private getProductById(cmp_uuid: string, pro_uuid: string): void {
    this._productsService.getProductById(cmp_uuid, pro_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          const productData = response.data;

          // Primero, actualiza los campos principales
          this.productForm.patchValue({
            cmp_uuid: productData.cmp_uuid,
            pro_uuid: productData.pro_uuid,
            pro_code: productData.pro_code,
            pro_name: productData.pro_name,
            pro_description: productData.pro_description,
            itm_uuid: productData.itm_uuid,
            cat_uuid: productData.cat_uuid
          });

          // Luego, actualiza el FormArray de variaciones
          const variationsArray = productData.productVariations || [];
          const variationsFormArray = this.productForm.get('productVariations') as FormArray;

          // Limpia variaciones existentes
          while (variationsFormArray.length !== 0) {
            variationsFormArray.removeAt(0);
          }

          // Añade cada variación
          variationsArray.forEach((variation: any) => {
            const variationGroup = this.fb.group({
              cmp_uuid: [variation.cmp_uuid || '', Validators.required],
              pro_uuid: [variation.pro_uuid || '', Validators.required],
              prov_uuid: [variation.prov_uuid || '', Validators.required],
              prov_code: [variation.prov_code || '', Validators.required],
              prov_sku: [variation.prov_sku || '', Validators.required],
              prov_name: [variation.prov_name || '', Validators.required],
              prov_description: [variation.prov_description || ''],
              prov_color: [variation.prov_color || ''],
              prov_size: [variation.prov_size || ''],
              prov_stock: [variation.prov_stock || 0, [Validators.required, Validators.min(0)]],
              prov_suggestedminimumsellingprice: [
                variation.prov_suggestedminimumsellingprice || 0,
                [Validators.required, Validators.min(0)]
              ]
            });
            variationsFormArray.push(variationGroup);
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

  // Método para añadir una fila de variación
  public addVariation(): void {
    const variationGroup = this.fb.group({
      cmp_uuid: ['', Validators.required],
      pro_uuid: ['', Validators.required],
      prov_uuid: ['', Validators.required],
      prov_code: ['', Validators.required],
      prov_sku: ['', Validators.required],
      prov_name: ['', Validators.required],
      prov_description: [''],
      prov_color: [''],
      prov_size: [''],
      prov_stock: [0, [Validators.required, Validators.min(0)]],
      prov_suggestedminimumsellingprice: [0, [Validators.required, Validators.min(0)]]
    });
    this.productVariations.push(variationGroup);
  }

  public removeVariation(index: number): void {
    this.productVariations.removeAt(index);
  }

  public editVariationDetails(index: number): void {
    const variation = this.productVariations.at(index).value;
    // Guardamos el estado actual del formulario en un servicio o lo pasamos por URL
    // Para un MVP, podemos navegar pasando el UUID de la variación
    this._router.navigate(['application/product-variation', variation.pro_uuid, variation.prov_uuid]);
  }

  private insertProduct(product: any): void {
    this._productsService.saveProduct(product).subscribe(
      (response: any) => {
        if (response.success) {
          this._messageService.success(
            "Informacion",
            "El Producto fue guardado correctamente.",
            () => {
              this._router.navigate(['application/products']);
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

  private updateProduct(product: any): void {
    this._productsService.updateProduct(product).subscribe(
      (response: any) => {
        if (response.success) {
          this._messageService.success(
            "Informacion",
            "El Producto fue actualizado correctamente.",
            () => {
              this._router.navigate(['application/products']);
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

  public onSave(): void {
    if (this.productForm.valid) {
      if (this.productForm.value.pro_uuid && this.productForm.value.pro_uuid != 'new') {
        this.updateProduct(this.productForm.value);
      } else {
        this.insertProduct(this.productForm.value);
      }
    }
  }

  public onCancel(): void {
    this._router.navigate(['application/products']);
  }
}
