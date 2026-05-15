import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { OrderInterface } from '../../core/interfaces/order/order.interface';

@Component({
  selector: 'app-orders-received',
  standalone: true,
  imports: [
    CommonModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzCardModule,
    NzAlertModule
  ],
  templateUrl: './orders-received.component.html',
  styleUrl: './orders-received.component.scss'
})
export class OrdersReceivedComponent implements OnInit {

  // Mock de Base de Datos Temporal
  public allOrders: OrderInterface[] = [];

  // Listas divididas para las pestañas
  public pendingOrders: OrderInterface[] = [];
  public processingOrders: OrderInterface[] = [];
  public shippedOrders: OrderInterface[] = [];

  // Control del Drawer Lateral (Vista de Detalles)
  public isDrawerVisible = false;
  public selectedOrder: OrderInterface | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private message: NzMessageService,
    private _ordersService: OrdersService,
    private _sessionService: SessionService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this._ordersService.getOrders(company.cmp_uuid).subscribe({
        next: (res: any) => {
          this.allOrders = res.data || [];
          this.filterOrdersIntoTabs();
        },
        error: (err: any) => {
          console.error('Error cargando ordenes:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- LOGICA DE DATOS ---

  private filterOrdersIntoTabs(): void {
    this.pendingOrders = this.allOrders.filter(o => o.ord_status === 'PENDING');
    this.processingOrders = this.allOrders.filter(o => o.ord_status === 'PROCESSING');
    this.shippedOrders = this.allOrders.filter(o => o.ord_status === 'SHIPPED');
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'gold';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Nuevo (Pendiente)';
      case 'PROCESSING': return 'En Preparación';
      case 'SHIPPED': return 'Despachado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  // --- ACCIONES DE ESTADO (KANBAN) ---

  public approvePayment(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'PROCESSING';
      this.filterOrdersIntoTabs();
      this.message.success(`Pago Aprobado. Pedido ${order.ord_ordernumber} pasó a Preparación.`);
      this.isDrawerVisible = false;
    }
  }

  public rejectPayment(order: OrderInterface): void {
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'CANCELLED';
      this.filterOrdersIntoTabs();
      this.message.error(`Pago Rechazado. Pedido ${order.ord_ordernumber} fue cancelado.`);
      this.isDrawerVisible = false;
    }
  }

  public markAsShipped(order: OrderInterface, event: Event): void {
    event.stopPropagation();
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'SHIPPED';
      this.filterOrdersIntoTabs();
      this.message.success(`Pedido ${order.ord_ordernumber} marcado como Despachado.`);
    }
  }

  // --- CONTROL DEL DRAWER ---

  public openOrderDetails(order: OrderInterface): void {
    this.selectedOrder = order;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedOrder = null, 300); // Esperar la animación css
  }

  // Se eliminó generateMockOrders
}
