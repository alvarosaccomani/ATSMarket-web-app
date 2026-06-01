import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { OrderInterface } from '../../core/interfaces/order/order.interface';

// Tipado mock para Retiros
export interface PayoutEvent {
  pay_uuid: string;
  pay_date: Date;
  pay_amount: number;
  pay_destination: string; // Ej: CBU terminado en 4321 / CVU MercadoPago
  pay_status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  pay_receipt_url?: string;
}

export interface RiderSettlementViewModel {
  rider_name: string;
  order_count: number;
  theoretical_cash: number;
  orders: OrderInterface[];
}

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzModalModule,
    NzTabsModule,
    NzDrawerModule,
    NzSpinModule,
    NzInputModule,
    NzAvatarModule,
    NzDividerModule
  ],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.scss'
})
export class FinancesComponent implements OnInit {

  // Saldos
  public availableBalance: number = 854000;
  public pendingSettlement: number = 210500;
  public totalWithdrawn: number = 4250000;

  // Historial
  public payoutHistory: PayoutEvent[] = [];

  // Módulo de Rendición de Repartidores (COD Settlements)
  public activeRiders: RiderSettlementViewModel[] = [];
  public selectedRider: RiderSettlementViewModel | null = null;
  public isSettlementDrawerVisible: boolean = false;
  public physicalCashReceived: number | null = null;
  public loadingRiders: boolean = false;

  constructor(
    private message: NzMessageService,
    private modal: NzModalService,
    private _ordersService: OrdersService,
    private _sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.generateMockPayouts();

    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.loadRiderCollections(company.cmp_uuid);
    }
  }

  // --- RENDICIÓN DE REPARTIDORES (LOGISTICA COD) ---

  public loadRiderCollections(companyUuid: string): void {
    this.loadingRiders = true;
    this._ordersService.getOrders(companyUuid).subscribe({
      next: (res: any) => {
        const orders: OrderInterface[] = res.data || [];
        
        // 1. Filtrar órdenes que sean locales (Motomensajería) y de tipo EFECTIVO/COD
        // y que estén en estado DELIVERED (Entregado) o SHIPPED (En Camino)
        // y que NO hayan sido conciliadas previamente en esta sesión de memoria
        const codOrders = orders.filter(o => 
          (o.ords_uuid === 'DELIVERED' || o.ords_uuid === 'SHIPPED') && 
          o.ord_customernotes && 
          o.ord_customernotes.includes('Motomensajería Local') && 
          o.ord_customernotes.toLowerCase().includes('efectivo') &&
          !(o as any).ord_is_reconciled
        );

        // 2. Agrupar de forma determinista en dos riders realistas
        const ridersMap = new Map<string, OrderInterface[]>();
        ridersMap.set('Ramiro González 🛵', []);
        ridersMap.set('Mateo Pereyra 🚴', []);

        codOrders.forEach(order => {
          const seed = order.ord_uuid.charCodeAt(0) % 2;
          const riderName = seed === 0 ? 'Ramiro González 🛵' : 'Mateo Pereyra 🚴';
          ridersMap.get(riderName)!.push(order);
        });

        // 3. Mapear para la grilla
        this.activeRiders = [];
        ridersMap.forEach((riderOrders, name) => {
          if (riderOrders.length > 0) {
            const sum = riderOrders.reduce((acc, o) => acc + (o.ord_total || 0), 0);
            this.activeRiders.push({
              rider_name: name,
              order_count: riderOrders.length,
              theoretical_cash: sum,
              orders: riderOrders
            });
          }
        });

        this.loadingRiders = false;
      },
      error: (err) => {
        console.error('Error al cargar conciliaciones de repartidores:', err);
        this.loadingRiders = false;
      }
    });
  }

  public openRiderSettlement(rider: RiderSettlementViewModel): void {
    this.selectedRider = rider;
    this.physicalCashReceived = rider.theoretical_cash; // Por defecto precompleta con el teórico
    this.isSettlementDrawerVisible = true;
  }

  public closeSettlementDrawer(): void {
    this.isSettlementDrawerVisible = false;
    setTimeout(() => {
      this.selectedRider = null;
      this.physicalCashReceived = null;
    }, 300);
  }

  public getCashDifference(): number {
    if (this.selectedRider === null || this.physicalCashReceived === null) return 0;
    return this.physicalCashReceived - this.selectedRider.theoretical_cash;
  }

  public getAbsoluteDiff(): number {
    return Math.abs(this.getCashDifference());
  }

  public confirmSettlement(): void {
    if (!this.selectedRider || this.physicalCashReceived === null) return;

    const collected = this.selectedRider.theoretical_cash;
    const received = this.physicalCashReceived;
    const diff = this.getCashDifference();

    // 1. Inyectar fondos recaudados al Saldo Disponible (disponible para retiro)
    this.availableBalance += received;

    // 2. Registrar en la bitácora de la billetera como un ingreso liquidado por repartidor
    const newTx: PayoutEvent = {
      pay_uuid: `rc-${new Date().getTime().toString().substring(8)}`,
      pay_date: new Date(),
      pay_amount: received,
      pay_destination: `Rendición de Caja: ${this.selectedRider.rider_name}`,
      pay_status: 'COMPLETED'
    };
    this.payoutHistory = [newTx, ...this.payoutHistory];

    // 3. Marcar órdenes como conciliadas localmente en memoria
    this.selectedRider.orders.forEach(o => {
      (o as any).ord_is_reconciled = true;
    });

    // 4. Toast dinámico según cuadre de caja
    if (diff === 0) {
      this.message.success(`Caja de ${this.selectedRider.rider_name} rendida por $${received.toLocaleString('es-AR')}.`);
    } else if (diff < 0) {
      this.message.warning(`Caja rendida con faltante de $${Math.abs(diff).toLocaleString('es-AR')}. Se conciliaron $${received.toLocaleString('es-AR')}.`);
    } else {
      this.message.info(`Caja rendida con sobrante de $${diff.toLocaleString('es-AR')}. Se conciliaron $${received.toLocaleString('es-AR')}.`);
    }

    // 5. Limpieza de Drawer
    this.closeSettlementDrawer();

    // 6. Recargar listado de repartidores pendientes
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.loadRiderCollections(company.cmp_uuid);
    }
  }

  public parseCustomerNotes(notes: string): any {
    if (!notes) return { shipping: '', payment: '' };
    const shippingMatch = notes.match(/\[Envío:\s*([^\]]+)\]/);
    const paymentMatch = notes.match(/Método de pago:\s*([^.]+)/);
    return {
      shipping: shippingMatch ? shippingMatch[1] : 'Moto',
      payment: paymentMatch ? paymentMatch[1].trim() : 'Efectivo'
    };
  }

  // --- ACCIONES FINANCIERAS (RETIROS BANCARIOS) ---

  public requestWithdrawal(): void {
    if (this.availableBalance <= 0) {
      this.message.warning('No tenés saldo disponible para retirar.');
      return;
    }

    this.modal.confirm({
      nzTitle: '¿Confirmar retiro de fondos?',
      nzContent: `Estás a punto de solicitar la transferencia de $${this.availableBalance.toLocaleString('es-AR')} a tu CBU principal terminado en 1234.`,
      nzOkText: 'Solicitar',
      nzOkType: 'primary',
      nzOnOk: () => this.executeWithdrawalMock()
    });
  }

  private executeWithdrawalMock(): void {
    const amount = this.availableBalance;
    this.availableBalance = 0;

    // Agregar a la tabla como pendiente
    const newPayout: PayoutEvent = {
      pay_uuid: `tx-${new Date().getTime().toString().substring(9)}`,
      pay_date: new Date(),
      pay_amount: amount,
      pay_destination: 'CBU ***1234 (Banco Galicia)',
      pay_status: 'PENDING'
    };

    this.payoutHistory = [newPayout, ...this.payoutHistory];
    this.message.success('Retiro solicitado con éxito. El dinero llegará en las próximas 24hs hábiles.');
  }

  // --- ETIQUETAS Y FORMATO ---

  public getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'PENDING': return 'gold';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Transferido';
      case 'PENDING': return 'En Proceso';
      case 'REJECTED': return 'Rechazado / Fallido';
      default: return 'Desconocido';
    }
  }

  // --- MOCK DATA ---

  private generateMockPayouts(): void {
    this.payoutHistory = [
      {
        pay_uuid: 'tx-9921',
        pay_date: new Date(new Date().setDate(new Date().getDate() - 2)),
        pay_amount: 150000,
        pay_destination: 'CVU ***8822 (MercadoPago)',
        pay_status: 'COMPLETED',
        pay_receipt_url: '#'
      },
      {
        pay_uuid: 'tx-9810',
        pay_date: new Date(new Date().setDate(new Date().getDate() - 15)),
        pay_amount: 850000,
        pay_destination: 'CBU ***1234 (Banco Galicia)',
        pay_status: 'COMPLETED',
        pay_receipt_url: '#'
      },
      {
        pay_uuid: 'tx-9705',
        pay_date: new Date(new Date().setDate(new Date().getDate() - 28)),
        pay_amount: 450000,
        pay_destination: 'CBU ***1234 (Banco Galicia)',
        pay_status: 'COMPLETED',
        pay_receipt_url: '#'
      },
      {
        pay_uuid: 'tx-9650',
        pay_date: new Date(new Date().setDate(new Date().getDate() - 40)),
        pay_amount: 220000,
        pay_destination: 'CBU ***9999 (Banco BBVA)',
        pay_status: 'REJECTED'
      }
    ];
  }
}
