import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

// Interfaces mock para Analytics
export interface TopProduct {
  name: string;
  sku: string;
  category: string;
  salesVolume: number;
  revenue: number;
  trend: 'up' | 'down';
}

export interface CategoryPerformance {
  category: string;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
    NzProgressModule,
    NzTableModule,
    NzAvatarModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {

  // KPIs
  public kpiRevenue = 3450500;
  public kpiOrders = 156;
  public kpiTicket = 22118;
  public kpiCustomers = 89;

  // Rendimiento de Categorías (Embudo/Mix de Ventas)
  public categoryMix: CategoryPerformance[] = [];

  // Top Productos
  public topProducts: TopProduct[] = [];

  constructor() { }

  ngOnInit(): void {
    this.generateMockAnalytics();
  }

  private generateMockAnalytics(): void {
    // Generar Mix de Categorías
    this.categoryMix = [
      { category: 'Santería y Velas', percentage: 45, color: '#f5222d' },
      { category: 'Orfebrería Litúrgica', percentage: 25, color: '#fa8c16' },
      { category: 'Indumentaria Divina', percentage: 15, color: '#1890ff' },
      { category: 'Impresos y Estampas', percentage: 10, color: '#52c41a' },
      { category: 'Otros (Crucifijos, etc)', percentage: 5, color: '#8c8c8c' }
    ];

    // Generar Top Productos
    this.topProducts = [
      {
        name: 'Pack Velas de Miel x50',
        sku: 'VEL-MIE-50',
        category: 'Santería',
        salesVolume: 850,
        revenue: 1445000,
        trend: 'up'
      },
      {
        name: 'Custodia Dorada 50cm',
        sku: 'ORF-CUS-50',
        category: 'Orfebrería',
        salesVolume: 12,
        revenue: 950000,
        trend: 'up'
      },
      {
        name: 'Rosario Madera Olivo',
        sku: 'ART-ROS-OLI',
        category: 'Santería',
        salesVolume: 1540,
        revenue: 770000,
        trend: 'down'
      },
      {
        name: 'Estampitas San Benito x100',
        sku: 'IMP-EST-BEN',
        category: 'Impresos',
        salesVolume: 4200,
        revenue: 210000,
        trend: 'up'
      },
      {
        name: 'Casulla Sacerdotal Blanca',
        sku: 'IND-CAS-BLA',
        category: 'Indumentaria',
        salesVolume: 5,
        revenue: 75500,
        trend: 'up'
      }
    ];
  }
}
