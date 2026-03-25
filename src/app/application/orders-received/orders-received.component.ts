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

// Tipado mock para los pedidos
export interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  ord_uuid: string;
  ord_number: string;
  ord_date: Date;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  ord_total: number;
  ord_status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  ord_items: OrderItem[];
}

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
    NzCardModule
  ],
  templateUrl: './orders-received.component.html',
  styleUrl: './orders-received.component.scss'
})
export class OrdersReceivedComponent implements OnInit {

  // Mock de Base de Datos Temporal
  public allOrders: Order[] = [];

  // Listas divididas para las pestañas
  public pendingOrders: Order[] = [];
  public processingOrders: Order[] = [];
  public shippedOrders: Order[] = [];

  // Control del Drawer Lateral (Vista de Detalles)
  public isDrawerVisible = false;
  public selectedOrder: Order | null = null;

  constructor(private message: NzMessageService) { }

  ngOnInit(): void {
    this.generateMockOrders();
    this.filterOrdersIntoTabs();
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

  public markAsProcessing(order: Order, event: Event): void {
    event.stopPropagation(); // Evita abrir el drawer al hacer click en el botón
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'PROCESSING';
      this.filterOrdersIntoTabs();
      this.message.info(`Pedido ${order.ord_number} pasó a Preparación.`);
    }
  }

  public markAsShipped(order: Order, event: Event): void {
    event.stopPropagation();
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'SHIPPED';
      this.filterOrdersIntoTabs();
      this.message.success(`Pedido ${order.ord_number} marcado como Despachado.`);
    }
  }

  // --- CONTROL DEL DRAWER ---

  public openOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedOrder = null, 300); // Esperar la animación css
  }

  // --- GENERACIÓN DE MOCKS ---

  private generateMockOrders(): void {
    this.allOrders = [
      {
        ord_uuid: 'uuid-1',
        ord_number: '#PED-10025',
        ord_date: new Date(),
        cus_name: 'Santería La Milagrosa',
        cus_email: 'ventas@lamilagrosa.com',
        cus_phone: '+54 11 4455-6677',
        ord_total: 125000,
        ord_status: 'PENDING',
        ord_items: [
          { name: 'Rosario Madera Olivo', sku: 'ROS-OLI', quantity: 100, price: 500 },
          { name: 'Medalla San Benito', sku: 'MED-BEN', quantity: 150, price: 500 }
        ]
      },
      {
        ord_uuid: 'uuid-2',
        ord_number: '#PED-10024',
        ord_date: new Date(new Date().setDate(new Date().getDate() - 1)),
        cus_name: 'María Carmen López',
        cus_email: 'maricarmen@gmail.com',
        cus_phone: '+54 223 555-1234',
        ord_total: 45000,
        ord_status: 'PENDING',
        ord_items: [
          { name: 'Estatua Virgen de Luján 30cm', sku: 'EST-LUJ-30', quantity: 2, price: 22500 }
        ]
      },
      {
        ord_uuid: 'uuid-3',
        ord_number: '#PED-10023',
        ord_date: new Date(new Date().setDate(new Date().getDate() - 2)),
        cus_name: 'Parroquia San Cayetano',
        cus_email: 'admin@sancayetano.org',
        cus_phone: '+54 11 2233-4455',
        ord_total: 350000,
        ord_status: 'PROCESSING',
        ord_items: [
          { name: 'Velas Blancas (Caja x50)', sku: 'VEL-BLA-50', quantity: 20, price: 5000 },
          { name: 'Incienso Litúrgico 1kg', sku: 'INC-LIT-1K', quantity: 5, price: 50000 }
        ]
      },
      {
        ord_uuid: 'uuid-4',
        ord_number: '#PED-10020',
        ord_date: new Date(new Date().setDate(new Date().getDate() - 5)),
        cus_name: 'Juan Pérez',
        cus_email: 'jperez@hotmail.com',
        cus_phone: '+54 11 9999-8888',
        ord_total: 15500,
        ord_status: 'SHIPPED',
        ord_items: [
          { name: 'Pulsera Decenario Plata', sku: 'PUL-DEC-PL', quantity: 1, price: 15500 }
        ]
      }
    ];
  }
}
