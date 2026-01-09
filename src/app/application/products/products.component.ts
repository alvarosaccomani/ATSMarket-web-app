import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ProductInterface } from '@interfaces/product';
import { ProductsService } from '@services/products.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  public products: ProductInterface[] = [];
  public misProductos = [
    {
      id: 1,
      nombre: 'Virgen de Luján 30cm',
      referencia: 'VL-30',
      nombreTienda: 'Caja Santos 33',
      rubro: 'Estatuas',
      categoria: 'Resina Premium',
      costo: 4500,
      precio: 8500,
      stock: 5
    },
    {
      id: 2,
      nombre: 'Rosario Madera Olivo',
      referencia: 'RO-OLV',
      nombreTienda: 'Taller de Fe',
      rubro: 'Rosarios',
      categoria: 'Madera Natural',
      costo: 1200,
      precio: 3200,
      stock: 12
    }
  ];

  constructor(
    private modal: NzModalService,
    private productService: ProductsService
  ) { }

  ngOnInit(): void {
    this.productService.getProducts('28a0036e-2d6b-4e83-805a-1ca214a6b1e1').subscribe((products: any) => {
      this.products = [...products.data];
    });
  }

  public abrirModalNuevo(): void {
    // Aquí abriríamos el formulario para definir Proveedor, Material, Costo, etc.
    this.modal.info({
      nzTitle: 'Nuevo Producto',
      nzContent: 'Aquí se abrirá el formulario con campos de Proveedor, Materiales, Rubros Personalizados y Cálculo de Margen de Ganancia.'
    });
  }

}
