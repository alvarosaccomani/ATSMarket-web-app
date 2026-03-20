import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ProductInterface } from '@interfaces/product';
import { SessionService } from '@services/session.service';
import { ProductsService } from '@services/products.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzEmptyModule,
    NzToolTipModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  public products: ProductInterface[] = [];
  public isFetching: boolean = true;

  constructor(
    private _router: Router,
    private modal: NzModalService,
    private _sessionService: SessionService,
    private productService: ProductsService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    this.getProducts(company.cmp_uuid);
  }

  public getProducts(cmp_uuid: string): void {
    this.isFetching = true;
    this.productService.getProducts(cmp_uuid).subscribe(
      (products: any) => {
        this.products = [...products.data];
        this.isFetching = false;
      },
      (error) => {
        console.error('Error fetching products', error);
        this.isFetching = false;
      }
    );
  }

  public abrirModalNuevo(): void {
    // Aquí abriríamos el formulario para definir Proveedor, Material, Costo, etc.
    this.modal.info({
      nzTitle: 'Nuevo Producto',
      nzContent: 'Aquí se abrirá el formulario con campos de Proveedor, Materiales, Rubros Personalizados y Cálculo de Margen de Ganancia.'
    });
  }

  public editProduct(product: ProductInterface): void {
    this._router.navigate(['/application/product', product.pro_uuid]);
  }

  public deleteProduct(product: ProductInterface): void {

  }

}
