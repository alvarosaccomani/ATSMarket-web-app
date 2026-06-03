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
  public isSubmittingItem: boolean = false;

  // Data Collections
  public companies: any[] = [];
  public allOrders: any[] = [];
  public globalCategories: any[] = [];
  public globalItems: any[] = [];

  // KPIs de la plataforma
  public totalCompaniesCount: number = 0;
  public activeCompaniesCount: number = 0;
  public totalSalesVolume: number = 0;
  public totalPlatformCommission: number = 0; // Comisiones acumuladas de plan comisión
  public totalSubscriptionsVolume: number = 0; // Abonos cobrados de plan suscripción
  public totalPlatformRevenue: number = 0; // Ingreso total unificado
  public commissionRate: number = 5; // Tarifa por defecto: 5%

  // Modelos de Cobro SaaS Híbrido
  public storePlans: { [key: string]: { type: 'commission' | 'subscription', fee: number } | undefined } = {};
  public settledCommissionIds: string[] = [];
  public subscriptionPayments: { [key: string]: { [month: string]: 'pending' | 'paid' } | undefined } = {};
  public currentBillingMonth: string = 'Junio 2026';

  // Filtros de Tiendas
  public searchStoreTerm: string = '';
  public selectedStoreStatus: string = 'all';

  // Filtros de Facturación
  public filterCommissionStatus: 'all' | 'pending' | 'settled' = 'all';
  public filterSubscriptionStatus: 'all' | 'pending' | 'paid' = 'all';

  // Modals / forms
  public isCategoryModalVisible: boolean = false;
  public isItemModalVisible: boolean = false;
  public categoryForm!: FormGroup;
  public itemForm!: FormGroup;
  public editingItemUuid: string | null = null;

  constructor(
    private fb: FormBuilder,
    private _companiesService: CompaniesService,
    private _ordersService: OrdersService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _globalItemsService: GlobalItemsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadGlobalPlatformData();
  }

  private initForms(): void {
    this.categoryForm = this.fb.group({
      gitm_uuid: [null, [Validators.required]],
      gcat_name: ['', [Validators.required]],
      gcat_description: ['', [Validators.required]]
    });

    this.itemForm = this.fb.group({
      gitm_name: ['', [Validators.required]],
      gitm_description: ['']
    });
  }

  public loadGlobalPlatformData(): void {
    this.isLoading = true;

    // Cargar configuraciones guardadas en localStorage
    const savedRate = localStorage.getItem('ats_platform_commission_rate');
    this.commissionRate = savedRate ? Number(savedRate) : 5;

    const savedPlans = localStorage.getItem('ats_store_plans');
    this.storePlans = savedPlans ? JSON.parse(savedPlans) : {};

    const savedSettled = localStorage.getItem('ats_settled_commission_orders');
    this.settledCommissionIds = savedSettled ? JSON.parse(savedSettled) : [];

    const savedPayments = localStorage.getItem('ats_subscription_payments');
    this.subscriptionPayments = savedPayments ? JSON.parse(savedPayments) : {};
    
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

        // Asegurar que cada tienda tenga un plan inicial cargado si no existe
        this.companies.forEach(company => {
          if (!this.storePlans[company.cmp_uuid]) {
            this.storePlans[company.cmp_uuid] = { type: 'commission', fee: 15000 };
          }
          // Asegurar que cada tienda de suscripción tenga registro para el mes actual
          const plan = this.storePlans[company.cmp_uuid];
          if (plan && plan.type === 'subscription') {
            if (!this.subscriptionPayments[company.cmp_uuid]) {
              this.subscriptionPayments[company.cmp_uuid] = {};
            }
            if (!this.subscriptionPayments[company.cmp_uuid]![this.currentBillingMonth]) {
              this.subscriptionPayments[company.cmp_uuid]![this.currentBillingMonth] = 'pending';
            }
          }
        });

        // Guardar estructura inicial
        localStorage.setItem('ats_store_plans', JSON.stringify(this.storePlans));
        localStorage.setItem('ats_subscription_payments', JSON.stringify(this.subscriptionPayments));

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
                const plan = this.storePlans[company.cmp_uuid] || { type: 'commission', fee: 15000 };
                
                // Enriquecemos la orden con el nombre de la compañía y el plan
                orders.forEach((o: any) => {
                  o.companyName = company.cmp_name;
                  o.billingPlan = plan.type;
                  
                  if (plan.type === 'commission') {
                    o.platformCommission = Number((o.ord_total * (this.commissionRate / 100)).toFixed(2));
                    o.commissionStatus = this.settledCommissionIds.includes(o.ord_uuid) ? 'settled' : 'pending';
                  } else {
                    o.platformCommission = 0;
                    o.commissionStatus = 'exempt'; // Exento
                  }
                });
                this.allOrders.push(...orders);
              });

              // Ordenamos pedidos por fecha de creación (más reciente primero)
              this.allOrders.sort((a, b) => new Date(b.ord_date).getTime() - new Date(a.ord_date).getTime());

              // Calculamos Métricas Financieras Consolidadas
              const activeOrders = this.allOrders.filter(o => o.ords_uuid !== 'CANCELLED');
              this.totalSalesVolume = activeOrders.reduce((sum, o) => sum + o.ord_total, 0);

              // 1. Comisiones Acumuladas
              const commissionOrders = activeOrders.filter(o => o.billingPlan === 'commission');
              this.totalPlatformCommission = commissionOrders.reduce((sum, o) => sum + o.platformCommission, 0);

              // 2. Suscripciones Cobradas
              this.totalSubscriptionsVolume = 0;
              this.companies.forEach(company => {
                if (company.cmp_status === 'active') {
                  const plan = this.storePlans[company.cmp_uuid];
                  if (plan && plan.type === 'subscription') {
                    const status = this.subscriptionPayments[company.cmp_uuid]?.[this.currentBillingMonth];
                    if (status === 'paid') {
                      this.totalSubscriptionsVolume += plan.fee;
                    }
                  }
                }
              });

              // 3. Ingresos SaaS Consolidados
              this.totalPlatformRevenue = this.totalPlatformCommission + this.totalSubscriptionsVolume;

              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error al recuperar órdenes de la plataforma:', err);
              this.isLoading = false;
            }
          });
        } else {
          this.totalPlatformRevenue = 0;
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

  // --- TIENDAS FILTRADAS ---
  public getFilteredCompanies(): any[] {
    return this.companies.filter(c => {
      const matchesSearch = c.cmp_name.toLowerCase().includes(this.searchStoreTerm.toLowerCase()) ||
                            c.cmp_slug.toLowerCase().includes(this.searchStoreTerm.toLowerCase()) ||
                            (c.cmp_phone && c.cmp_phone.includes(this.searchStoreTerm));
      
      const matchesStatus = this.selectedStoreStatus === 'all' || c.cmp_status === this.selectedStoreStatus;
      return matchesSearch && matchesStatus;
    });
  }

  // --- CONTADOR DE TIENDAS PENDIENTES ---
  public getPendingCompaniesCount(): number {
    return this.companies.filter(c => c.cmp_status === 'pending').length;
  }

  // --- COMISIONES FILTRADAS ---
  public getFilteredCommissions(): any[] {
    return this.allOrders.filter(o => {
      if (this.filterCommissionStatus === 'all') return true;
      return o.commissionStatus === this.filterCommissionStatus;
    });
  }

  // --- TIENDAS SUSCRITAS FILTRADAS ---
  public getSubscriptionStores(): any[] {
    return this.companies.filter(c => {
      const plan = this.storePlans[c.cmp_uuid];
      if (!plan || plan.type !== 'subscription') return false;

      const status = this.subscriptionPayments[c.cmp_uuid]?.[this.currentBillingMonth] || 'pending';
      if (this.filterSubscriptionStatus === 'all') return true;
      return status === this.filterSubscriptionStatus;
    });
  }

  // --- MODERACIÓN DE TENANTS (TIENDAS) ---
  public updateCompanyStatus(company: any, newStatus: 'active' | 'inactive' | 'pending'): void {
    if (!company || !company.cmp_uuid) return;
    
    this.isLoading = true;
    const updatedCompany = { ...company, cmp_status: newStatus };

    this._companiesService.updateCompany(company.cmp_uuid, updatedCompany).subscribe({
      next: () => {
        this.message.success(`Tienda "${company.cmp_name}" marcada como ${this.getStatusLabel(newStatus)}.`);
        this.loadGlobalPlatformData();
      },
      error: (err) => {
        console.error('Error al actualizar estado de la tienda:', err);
        this.message.error('No se pudo modificar el estado de la tienda.');
        this.isLoading = false;
      }
    });
  }

  // --- ACTUALIZAR PLAN DE FACTURACIÓN DE LA TIENDA ---
  public updateStorePlanType(companyUuid: string, type: 'commission' | 'subscription'): void {
    if (!this.storePlans[companyUuid]) {
      this.storePlans[companyUuid] = { type: 'commission', fee: 15000 };
    }
    this.storePlans[companyUuid]!.type = type;
    
    if (type === 'subscription') {
      if (!this.subscriptionPayments[companyUuid]) {
        this.subscriptionPayments[companyUuid] = {};
      }
      if (!this.subscriptionPayments[companyUuid]![this.currentBillingMonth]) {
        this.subscriptionPayments[companyUuid]![this.currentBillingMonth] = 'pending';
      }
    }

    localStorage.setItem('ats_store_plans', JSON.stringify(this.storePlans));
    localStorage.setItem('ats_subscription_payments', JSON.stringify(this.subscriptionPayments));
    
    this.message.success('Plan de cobro actualizado.');
    this.loadGlobalPlatformData();
  }

  public updateStoreSubscriptionFee(companyUuid: string, event: any): void {
    const fee = Number(event.target.value);
    if (isNaN(fee) || fee < 0) return;

    if (!this.storePlans[companyUuid]) {
      this.storePlans[companyUuid] = { type: 'commission', fee: 15000 };
    }
    this.storePlans[companyUuid]!.fee = fee;
    
    localStorage.setItem('ats_store_plans', JSON.stringify(this.storePlans));
    this.message.success('Abono mensual actualizado.');
    this.loadGlobalPlatformData();
  }

  // --- CAMBIAR TASA DE COMISIÓN GLOBAL ---
  public onCommissionRateChange(newRate: any): void {
    const val = Number(newRate);
    if (isNaN(val) || val < 0 || val > 100) {
      this.message.error('Por favor ingresa una tasa válida entre 0 y 100.');
      return;
    }
    this.commissionRate = val;
    localStorage.setItem('ats_platform_commission_rate', String(val));
    this.message.success(`Tasa de comisión global configurada en ${val}%.`);
    this.loadGlobalPlatformData();
  }

  // --- LIQUIDACIÓN DE COMISIONES ---
  public settleCommission(orderUuid: string): void {
    if (!this.settledCommissionIds.includes(orderUuid)) {
      this.settledCommissionIds.push(orderUuid);
      localStorage.setItem('ats_settled_commission_orders', JSON.stringify(this.settledCommissionIds));
      this.message.success('Comisión marcada como Liquidada.');
      this.loadGlobalPlatformData();
    }
  }

  public settleAllCommissions(companyUuid: string): void {
    let count = 0;
    this.allOrders.forEach(o => {
      if (o.cmp_uuid === companyUuid && o.billingPlan === 'commission' && o.commissionStatus === 'pending' && o.ords_uuid !== 'CANCELLED') {
        this.settledCommissionIds.push(o.ord_uuid);
        count++;
      }
    });

    if (count > 0) {
      localStorage.setItem('ats_settled_commission_orders', JSON.stringify(this.settledCommissionIds));
      this.message.success(`Se liquidaron ${count} comisiones pendientes con éxito.`);
      this.loadGlobalPlatformData();
    } else {
      this.message.info('No hay comisiones pendientes para liquidar en esta tienda.');
    }
  }

  // --- REGISTRAR PAGO DE SUSCRIPCIÓN ---
  public paySubscription(companyUuid: string): void {
    if (!this.subscriptionPayments[companyUuid]) {
      this.subscriptionPayments[companyUuid] = {};
    }
    this.subscriptionPayments[companyUuid]![this.currentBillingMonth] = 'paid';
    
    localStorage.setItem('ats_subscription_payments', JSON.stringify(this.subscriptionPayments));
    this.message.success('Abono mensual registrado como Cobrado.');
    this.loadGlobalPlatformData();
  }

  // --- GESTIÓN DE RUBROS GLOBALES (CRUD) ---
  public openItemModal(item?: any): void {
    if (item) {
      this.editingItemUuid = item.gitm_uuid;
      this.itemForm.patchValue({
        gitm_name: item.gitm_name,
        gitm_description: item.gitm_description || ''
      });
    } else {
      this.editingItemUuid = null;
      this.itemForm.reset();
    }
    this.isItemModalVisible = true;
  }

  public handleItemCancel(): void {
    this.isItemModalVisible = false;
  }

  public submitItem(): void {
    if (this.itemForm.valid) {
      this.isSubmittingItem = true;
      const itemData = this.itemForm.value;

      if (this.editingItemUuid) {
        this._globalItemsService.updateGlobalItem(this.editingItemUuid, itemData).subscribe({
          next: () => {
            this.message.success('Rubro Global actualizado con éxito.');
            this.isItemModalVisible = false;
            this.isSubmittingItem = false;
            this.loadGlobalPlatformData();
          },
          error: (err) => {
            console.error('Error al actualizar rubro global:', err);
            this.message.error('No se pudo actualizar el rubro.');
            this.isSubmittingItem = false;
          }
        });
      } else {
        this._globalItemsService.saveGlobalItem(itemData).subscribe({
          next: () => {
            this.message.success('Rubro Global creado con éxito.');
            this.isItemModalVisible = false;
            this.isSubmittingItem = false;
            this.loadGlobalPlatformData();
          },
          error: (err) => {
            console.error('Error al crear rubro global:', err);
            this.message.error('No se pudo crear el rubro.');
            this.isSubmittingItem = false;
          }
        });
      }
    } else {
      Object.values(this.itemForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public deleteGlobalItem(item: any): void {
    if (!item || !item.gitm_uuid) return;

    const hasCategories = this.globalCategories.some(c => c.gitm_uuid === item.gitm_uuid);
    if (hasCategories) {
      this.message.error('No se puede eliminar un rubro que tiene categorías asociadas. Elimínalas primero.');
      return;
    }

    this.isLoading = true;
    this._globalItemsService.deleteGlobalItem(item.gitm_uuid).subscribe({
      next: () => {
        this.message.success('Rubro Global eliminado con éxito.');
        this.loadGlobalPlatformData();
      },
      error: (err) => {
        console.error('Error al eliminar rubro global:', err);
        this.message.error('No se pudo eliminar el rubro global.');
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
          this.loadGlobalPlatformData();
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
