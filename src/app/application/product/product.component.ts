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
import { SessionService } from '@services/session.service';
import { ItemsService } from '@services/items.service';
import { CategoriesService } from '@services/categories.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { MessageService } from '@services/message.service';
import { ProductsService } from '@services/products.service';
import { StockMovementsService } from '@services/stock-movements.service';
import { forkJoin } from 'rxjs';

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
    NzToolTipModule,
    NzSelectModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  productForm!: FormGroup;
  public categories: any[] = [];
  public items: any[] = [];
  public currentCmpUuid: string = '';
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sessionService: SessionService,
    private _itemsService: ItemsService,
    private _categoriesService: CategoriesService,
    private _productsService: ProductsService,
    private _messageService: MessageService,
    private _stockMovementsService: StockMovementsService
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

    const company = this._sessionService.getCompany();
    this.currentCmpUuid = company.cmp_uuid;

    this.productForm.patchValue({
      cmp_uuid: this.currentCmpUuid
    });

    this.loadItems(this.currentCmpUuid);

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

    // Debug de validación
    this.productForm.statusChanges.subscribe(status => {
      if (status === 'INVALID') {
        const invalidFields: string[] = [];
        const controls = this.productForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            invalidFields.push(name);
          }
        }
        console.log('Campos inválidos en raíz:', invalidFields);
        
        this.productVariations.controls.forEach((group, i) => {
          if (group.invalid) {
            console.log(`Variación ${i} es inválida`);
          }
        });
      }
    });

    // Escuchar cambios en el Rubro para cargar categorías
    this.productForm.get('itm_uuid')?.valueChanges.subscribe(itmUuid => {
      if (itmUuid) {
        this.loadCategories(itmUuid);
      } else {
        this.categories = [];
      }
    });
  }

  private loadCategories(itm_uuid: string): void {
    if (!itm_uuid) return;
    this._categoriesService.getCategories(this.currentCmpUuid, itm_uuid).subscribe((res: any) => {
      this.categories = res.data || [];
    });
  }

  private loadItems(cmp_uuid: string): void {
    this._itemsService.getItems(cmp_uuid).subscribe((res: any) => {
      this.items = res.data || [];
    });
  }

  // Getter para acceder al array de variaciones fácilmente
  get productVariations(): FormArray {
    return this.productForm.get('productVariations') as FormArray;
  }

  private getProductById(cmp_uuid: string, pro_uuid: string): void {
    this.isLoading = true;
    this._productsService.getProductById(cmp_uuid, pro_uuid).subscribe(
      (response: any) => {
        this.isLoading = false;
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
              pro_uuid: [variation.pro_uuid || ''],
              prov_uuid: [variation.prov_uuid || ''],
              prov_code: [variation.prov_code || '', Validators.required],
              prov_sku: [variation.prov_sku || '', Validators.required],
              prov_name: [variation.prov_name || '', Validators.required],
              prov_description: [variation.prov_description || ''],
              prov_color: [variation.prov_color || ''],
              prov_size: [variation.prov_size || ''],
              prov_stock: [{ value: variation.prov_stock || 0, disabled: true }, [Validators.required, Validators.min(0)]],
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
        this.isLoading = false;
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
      cmp_uuid: [this.currentCmpUuid, Validators.required],
      pro_uuid: [this.productForm.get('pro_uuid')?.value || ''],
      prov_uuid: [''],
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
    this.isLoading = true;
    this._productsService.saveProduct(product).subscribe(
      (response: any) => {
        if (response.success) {
          const savedProduct = response.data;
          const variations = savedProduct?.productVariations || [];
          
          // Registrar carga inicial de inventario (IN) para variantes con stock > 0
          const movementRequests = variations
            .filter((v: any) => v.prov_stock > 0)
            .map((v: any) => {
              const movementPayload = {
                cmp_uuid: savedProduct.cmp_uuid,
                pro_uuid: savedProduct.pro_uuid,
                prov_uuid: v.prov_uuid,
                ord_uuid: null,
                usr_uuid: null,
                tsmo_uuid: 'IN',
                smo_quantity: v.prov_stock,
                smo_previousstock: 0,
                smo_currentstock: v.prov_stock,
                smo_reason: 'Carga inicial de inventario',
                smo_createdat: new Date()
              };
              return this._stockMovementsService.saveStockMovement(movementPayload);
            });

          if (movementRequests.length > 0) {
            forkJoin(movementRequests).subscribe({
              next: () => {
                console.info('Movimientos de carga inicial (IN) registrados exitosamente para nuevas variantes.');
                this.isLoading = false;
                this._messageService.success(
                  "Informacion",
                  "El Producto fue guardado correctamente.",
                  () => {
                    this._router.navigate(['application/products']);
                  }
                );
              },
              error: (err) => {
                console.error('Error al registrar movimientos de carga inicial:', err);
                this.isLoading = false;
                this._messageService.success(
                  "Informacion",
                  "El Producto fue guardado correctamente.",
                  () => {
                    this._router.navigate(['application/products']);
                  }
                );
              }
            });
          } else {
            this.isLoading = false;
            this._messageService.success(
              "Informacion",
              "El Producto fue guardado correctamente.",
              () => {
                this._router.navigate(['application/products']);
              }
            );
          }
        } else {
          this.isLoading = false;
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

  private updateProduct(product: any): void {
    // Identificar las variaciones que no tenían UUID antes de mandar la petición (son nuevas)
    const newVariationsInForm = (product.productVariations || [])
      .filter((v: any) => !v.prov_uuid || v.prov_uuid === '' || v.prov_uuid === 'new');

    this.isLoading = true;
    this._productsService.updateProduct(product).subscribe(
      (response: any) => {
        if (response.success) {
          const savedProduct = response.data;
          const savedVariations = savedProduct?.productVariations || [];
          
          // Filtrar aquellas variaciones guardadas que coinciden con las nuevas del formulario
          // y que tengan stock inicial mayor a 0
          const newSavedVariations = savedVariations.filter((sv: any) => 
            newVariationsInForm.some((nv: any) => nv.prov_sku === sv.prov_sku && sv.prov_stock > 0)
          );

          const movementRequests = newSavedVariations.map((v: any) => {
            const movementPayload = {
              cmp_uuid: savedProduct.cmp_uuid,
              pro_uuid: savedProduct.pro_uuid,
              prov_uuid: v.prov_uuid,
              ord_uuid: null,
              usr_uuid: null,
              tsmo_uuid: 'IN',
              smo_quantity: v.prov_stock,
              smo_previousstock: 0,
              smo_currentstock: v.prov_stock,
              smo_reason: 'Carga inicial de inventario',
              smo_createdat: new Date()
            };
            return this._stockMovementsService.saveStockMovement(movementPayload);
          });

          if (movementRequests.length > 0) {
            forkJoin(movementRequests).subscribe({
              next: () => {
                console.info('Movimientos de carga inicial (IN) registrados exitosamente para nuevas variantes agregadas.');
                this.isLoading = false;
                this._messageService.success(
                  "Informacion",
                  "El Producto fue actualizado correctamente.",
                  () => {
                    this._router.navigate(['application/products']);
                  }
                );
              },
              error: (err) => {
                console.error('Error al registrar movimientos de carga inicial para nuevas variantes:', err);
                this.isLoading = false;
                this._messageService.success(
                  "Informacion",
                  "El Producto fue actualizado correctamente.",
                  () => {
                    this._router.navigate(['application/products']);
                  }
                );
              }
            });
          } else {
            this.isLoading = false;
            this._messageService.success(
              "Informacion",
              "El Producto fue actualizado correctamente.",
              () => {
                this._router.navigate(['application/products']);
              }
            );
          }
        } else {
          this.isLoading = false;
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

  public onSave(): void {
    if (this.productForm.valid) {
      const rawProduct = this.productForm.getRawValue();
      if (rawProduct.pro_uuid && rawProduct.pro_uuid != 'new') {
        this.updateProduct(rawProduct);
      } else {
        this.insertProduct(rawProduct);
      }
    } else {
      console.warn('Formulario inválido:', this.productForm.getRawValue());
      Object.keys(this.productForm.controls).forEach(key => {
        const controlErrors = this.productForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Error en campo ' + key + ':', controlErrors);
        }
      });
      // También chequear el FormArray
      const variations = this.productVariations;
      variations.controls.forEach((group, index) => {
        const g = group as FormGroup;
        Object.keys(g.controls).forEach(key => {
          const controlErrors = g.get(key)?.errors;
          if (controlErrors != null) {
            console.log('Error en variación ' + index + ' campo ' + key + ':', controlErrors);
          }
        });
      });
    }
  }

  public onCancel(): void {
    this._router.navigate(['application/products']);
  }
}
