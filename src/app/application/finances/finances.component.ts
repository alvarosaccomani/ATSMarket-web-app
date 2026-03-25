import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

// Tipado mock para Retiros
export interface PayoutEvent {
  pay_uuid: string;
  pay_date: Date;
  pay_amount: number;
  pay_destination: string; // Ej: CBU terminado en 4321 / CVU MercadoPago
  pay_status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  pay_receipt_url?: string;
}

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzModalModule
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

  constructor(
    private message: NzMessageService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.generateMockPayouts();
  }

  // --- ACCIONES FINANCIERAS ---

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
      pay_uuid: `tx-${new Date().getTime()}`,
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
