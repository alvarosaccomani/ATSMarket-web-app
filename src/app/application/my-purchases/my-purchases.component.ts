import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { CompaniesService } from '../../core/services/companies.service';
import { OrderInterface } from '../../core/interfaces/order/order.interface';

@Component({
  selector: 'app-my-purchases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzAlertModule,
    NzCollapseModule,
    NzSpinModule
  ],
  templateUrl: './my-purchases.component.html',
  styleUrl: './my-purchases.component.scss'
})
export class MyPurchasesComponent implements OnInit {

  public isLoading = true;
  public customer: any = null;
  public purchases: OrderInterface[] = [];
  public companyNamesCache: { [cmp_uuid: string]: string } = {};

  constructor(
    private _ordersService: OrdersService,
    private _sessionService: SessionService,
    private _companiesService: CompaniesService
  ) { }

  ngOnInit(): void {
    this.customer = this._sessionService.getCustomer();
    if (this.customer && this.customer.cus_uuid) {
      this.loadPurchases(this.customer.cus_uuid);
    } else {
      this.isLoading = false;
    }
  }

  private loadPurchases(cusUuid: string): void {
    this.isLoading = true;
    this._ordersService.getOrdersByCustomer(cusUuid).subscribe({
      next: (res: any) => {
        // En una respuesta real o mock api
        this.purchases = res.data || [];
        // Ordenar por fecha descendente (más recientes primero)
        this.purchases.sort((a, b) => {
          return new Date(b.ord_date).getTime() - new Date(a.ord_date).getTime();
        });
        
        // Cargar nombres de las empresas de forma diferida
        this.loadCompanyNames(this.purchases);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar compras:', err);
        this.isLoading = false;
      }
    });
  }

  private loadCompanyNames(orders: OrderInterface[]): void {
    orders.forEach(order => {
      if (order.cmp_uuid && !this.companyNamesCache[order.cmp_uuid]) {
        this._companiesService.getCompanyById(order.cmp_uuid).subscribe({
          next: (res: any) => {
            if (res.success && res.data) {
              const cmp = Array.isArray(res.data) ? res.data[0] : res.data;
              if (cmp) {
                this.companyNamesCache[order.cmp_uuid] = cmp.cmp_name || 'Comercio ATSMarket';
              }
            }
          },
          error: (err: any) => {
            console.error('Error fetching company details:', err);
            this.companyNamesCache[order.cmp_uuid] = 'Comercio ATSMarket';
          }
        });
      }
    });
  }

  public getStatusStep(status: string): number {
    switch (status) {
      case 'PENDING': return 1;      // Pago Aprobado / Pendiente
      case 'PROCESSING': return 2;   // En Preparación
      case 'SHIPPED': return 3;      // En Camino / Despachado
      case 'DELIVERED': return 4;    // Entregado
      default: return 1;
    }
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'gold';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'orange';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente de Aprobación';
      case 'PROCESSING': return 'En Preparación';
      case 'SHIPPED': return 'En Camino / Despachado';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  public getDeliveryType(notes: string): { label: string, icon: string, color: string } {
    if (!notes) return { label: 'Correo Postal', icon: 'global', color: 'blue' };
    if (notes.includes('Motomensajería Local')) {
      return { label: '🚴 Motomensajería Local (Express)', icon: 'car', color: 'cyan' };
    } else if (notes.includes('Correo Postal Nacional')) {
      return { label: '📦 Correo Postal Nacional', icon: 'global', color: 'blue' };
    } else if (notes.includes('Retiro en el Local')) {
      return { label: '🏪 Retiro en el Local (Gratis)', icon: 'shop', color: 'green' };
    } else if (notes.includes('Acordar con el Vendedor')) {
      return { label: '💬 Coordinar con el Vendedor (A convenir)', icon: 'message', color: 'orange' };
    }
    return { label: 'Envío General', icon: 'global', color: 'blue' };
  }

  public getIncidentDetail(notes: string): string | null {
    if (!notes) return null;
    const match = notes.match(/\[⚠️ INCIDENCIA:\s*([^\]]+)\]/);
    return match ? match[1] : null;
  }

  public parseCustomerNotes(notes: string): any {
    if (!notes) return { shipping: 'No especificado', payment: 'No especificado', voucher: 'N/A', cleanNotes: '' };
    
    let shipping = '';
    let payment = '';
    let voucher = '';

    const shippingMatch = notes.match(/\[Envío:\s*([^\]]+)\]/);
    if (shippingMatch) {
      shipping = shippingMatch[1];
    }

    const paymentMatch = notes.match(/Método de pago:\s*([^.]+)/);
    if (paymentMatch) {
      payment = paymentMatch[1].trim();
    }

    const voucherMatch = notes.match(/Comprobante:\s*(\S+)/);
    if (voucherMatch) {
      voucher = voucherMatch[1].trim();
    }

    // Limpiar notas para el cliente
    let cleanNotes = notes;
    // Eliminar etiquetas estructuradas del flete
    cleanNotes = cleanNotes.replace(/\[⚠️ INCIDENCIA:\s*([^\]]+)\]\s*\|\s*/g, '');
    cleanNotes = cleanNotes.replace(/\[Envío:\s*([^\]]+)\]\s*\|\s*/g, '');
    cleanNotes = cleanNotes.replace(/Método de pago:\s*([^.]+)\.?/g, '');
    cleanNotes = cleanNotes.replace(/Comprobante:\s*(\S+)/g, '');
    cleanNotes = cleanNotes.replace(/\|/g, '').trim();

    return {
      shipping: shipping || 'No especificado',
      payment: payment || 'No especificado',
      voucher: voucher || 'N/A',
      cleanNotes: cleanNotes
    };
  }

  public getMockOrderItems(orderUuid: string): { name: string; qty: number }[] {
    const seed = orderUuid.charCodeAt(0) % 4;
    switch(seed) {
      case 0: return [
        { name: 'Difusor de Ambientes Vainilla Premium', qty: 1 },
        { name: 'Vela Aromática Soja Jazmín en Frasco de Vidrio', qty: 2 }
      ];
      case 1: return [
        { name: 'Sahumerios Ecológicos Naturales Sagrada Madre (Caja x8)', qty: 3 },
        { name: 'Portasahumerio Artesanal Cerámica Rústica', qty: 1 }
      ];
      case 2: return [
        { name: 'Esencia Concentrada Lavanda para Hornillo (20ml)', qty: 1 },
        { name: 'Aceite Esencial Puro de Limón Orgánico', qty: 2 },
        { name: 'Humidificador Ultrasónico LED con Madera', qty: 1 }
      ];
      default: return [
        { name: 'Kit de Limpieza Energética (Hierbas, Carbones y Resina)', qty: 1 }
      ];
    }
  }

  public getWhatsAppLink(order: OrderInterface): string {
    const storeName = this.companyNamesCache[order.cmp_uuid] || 'la tienda';
    const msg = `Hola ${storeName}! Te escribo por mi compra #PED-${order.ord_ordernumber}. Quería realizar una consulta sobre el estado del envío.`;
    // Retorna link de chat
    return `https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`; // Usar teléfono mock o genérico
  }
}
