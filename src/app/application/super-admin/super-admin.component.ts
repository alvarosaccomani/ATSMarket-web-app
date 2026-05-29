import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Services
import { CompaniesService } from '@services/companies.service';
import { OrdersService } from '@services/orders.service';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { GlobalItemsService } from '@services/global-items.service';

// Ant Design Imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzMessageModule,
    NzTabsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzAlertModule
  ],
  templateUrl: './super-admin.component.html',
  styleUrl: './super-admin.component.scss'
})
export class SuperAdminComponent implements OnInit {

  // Loaders
  public isLoading: boolean = true;
  public isSubmittingCategory: boolean = false;

  // Data Collections
  public companies: any[] = [];
  public allOrders: any[] = [];
  public globalCategories: any[] = [];
  public globalItems: any[] = [];

  // KPIs
  public totalCompaniesCount: number = 0;
  public activeCompaniesCount: number = 0;
  public totalSalesVolume: number = 0;
  public totalPlatformCommission: number = 0;
  public commissionRate: number = 5; // Tarifa por defecto: 5%

  // Modals / forms
  public isCategoryModalVisible: boolean = false;
  public categoryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _companiesService: CompaniesService,
    private _ordersService: OrdersService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _globalItemsService: GlobalItemsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.initCategoryForm();
    this.loadGlobalPlatformData();
  }

  private initCategoryForm(): void {
    this.categoryForm = this.fb.group({
      gitm_uuid: [null, [Validators.required]],
      gcat_name: ['', [Validators.required]],
      gcat_description: ['', [Validators.required]]
    });
  }

  public loadGlobalPlatformData(): void {
    this.isLoading = true;
    
    // Consultamos las Tiendas, Categorías Globales y Rubros de la plataforma en paralelo
    forkJoin({
      companiesRes: this._companiesService.getCompanies().pipe(catchError(() => of({ data: [] }))),
      categoriesRes: this._globalCategoriesService.getGlobalCategories().pipe(catchError(() => of({ data: [] }))),
      itemsRes: this._globalItemsService.getGlobalItems().pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: (results: any) => {
        this.companies = results.companiesRes?.data || [];
        this.globalCategories = results.categoriesRes?.data || [];
        this.globalItems = results.itemsRes?.data || [];

        this.totalCompaniesCount = this.companies.length;
        this.activeCompaniesCount = this.companies.filter(c => c.cmp_status === 'active').length;

        // Si hay tiendas, cargamos los pedidos reales de cada una de ellas de forma concurrente
        if (this.companies.length > 0) {
          const orderRequests = this.companies.map(company => 
            this._ordersService.getOrders(company.cmp_uuid).pipe(
              catchError(() => of({ data: [] }))
            )
          );

          forkJoin(orderRequests).subscribe({
            next: (orderResults: any[]) => {
              // Unificamos el listado completo de pedidos en un solo array
              this.allOrders = [];
              orderResults.forEach((res, index) => {
                const company = this.companies[index];
                const orders = res?.data || [];
                // Enriquecemos la orden con el nombre de la compañía
                orders.forEach((o: any) => {
                  o.companyName = company.cmp_name;
                  o.platformCommission = Number((o.ord_total * (this.commissionRate / 100)).toFixed(2));
                });
                this.allOrders.push(...orders);
              });

              // Ordenamos pedidos por fecha de creación (más reciente primero)
              this.allOrders.sort((a, b) => new Date(b.ord_date).getTime() - new Date(a.ord_date).getTime());

              // Calculamos Métricas Financieras Consolidadas
              const nonCancelledOrders = this.allOrders.filter(o => o.ords_uuid !== 'CANCELLED');
              this.totalSalesVolume = nonCancelledOrders.reduce((sum, o) => sum + o.ord_total, 0);
              this.totalPlatformCommission = nonCancelledOrders.reduce((sum, o) => sum + o.platformCommission, 0);

              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error al recuperar órdenes de la plataforma:', err);
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error general al cargar los datos del SuperAdmin:', err);
        this.message.error('Ocurrió un error al cargar la información global.');
        this.isLoading = false;
      }
    });
  }

  // --- MODERACIÓN DE TENANTS (TIENDAS) ---

  public updateCompanyStatus(company: any, newStatus: 'active' | 'inactive' | 'pending'): void {
    if (!company || !company.cmp_uuid) return;
    
    this.isLoading = true;
    const updatedCompany = { ...company, cmp_status: newStatus };

    this._companiesService.updateCompany(company.cmp_uuid, updatedCompany).subscribe({
      next: (res) => {
        this.message.success(`Tienda "${company.cmp_name}" marcada como ${this.getStatusLabel(newStatus)}.`);
        this.loadGlobalPlatformData(); // Recargar datos para refrescar la UI
      },
      error: (err) => {
        console.error('Error al actualizar estado de la tienda:', err);
        this.message.error('No se pudo modificar el estado de la tienda.');
        this.isLoading = false;
      }
    });
  }

  // --- GESTIÓN DE CATEGORÍAS GLOBALES ---

  public openCategoryModal(): void {
    this.categoryForm.reset();
    this.isCategoryModalVisible = true;
  }

  public handleCategoryCancel(): void {
    this.isCategoryModalVisible = false;
  }

  public submitCategory(): void {
    if (this.categoryForm.valid) {
      this.isSubmittingCategory = true;
      const categoryData = this.categoryForm.value;

      this._globalCategoriesService.saveGlobalCategory(categoryData).subscribe({
        next: () => {
          this.message.success('Categoría Global creada exitosamente.');
          this.isCategoryModalVisible = false;
          this.isSubmittingCategory = false;
          this.loadGlobalPlatformData(); // Recargar datos
        },
        error: (err) => {
          console.error('Error al crear categoría global:', err);
          this.message.error('No se pudo crear la categoría global.');
          this.isSubmittingCategory = false;
        }
      });
    } else {
      Object.values(this.categoryForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public deleteGlobalCategory(category: any): void {
    if (!category || !category.gitm_uuid || !category.gcat_uuid) return;

    this.isLoading = true;
    this._globalCategoriesService.deleteGlobalCategory(category.gitm_uuid, category.gcat_uuid).subscribe({
      next: () => {
        this.message.success('Categoría Global eliminada con éxito.');
        this.loadGlobalPlatformData();
      },
      error: (err) => {
        console.error('Error al eliminar categoría global:', err);
        this.message.error('No se pudo eliminar la categoría.');
        this.isLoading = false;
      }
    });
  }

  // --- MÉTODOS DE SOPORTE PARA UI ---

  public getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activa / Habilitada';
      case 'inactive': return 'Pausada / Suspendida';
      case 'pending': return 'Pendiente de Auditoría';
      default: return status;
    }
  }

  public getOrderStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'orange';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  }

  public getOrderStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PROCESSING': return 'Preparando';
      case 'SHIPPED': return 'En Camino';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  public getGlobalItemName(gitm_uuid: string): string {
    const item = this.globalItems.find(i => i.gitm_uuid === gitm_uuid);
    return item ? item.gitm_name : 'General';
  }
}
