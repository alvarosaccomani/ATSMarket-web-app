import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

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

import { ProductInterface } from '@interfaces/product';
import { SessionService } from '@services/session.service';
import { ProductsService } from '@services/products.service';
import { MessageService } from '@services/message.service';

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
    NzDescriptionsModule
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

  constructor(
    private _router: Router,
    private modal: NzModalService,
    private _sessionService: SessionService,
    private _productService: ProductsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    this.getProducts(company.cmp_uuid);

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
}
