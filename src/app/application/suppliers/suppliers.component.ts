import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { SuppliersService } from '@services/suppliers.service';
import { SessionService } from '@services/session.service';
import { SupplierInterface } from '@interfaces/supplier';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzTagModule,
    NzInputModule,
    NzAvatarModule,
    NzSpaceModule
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {
 
  public allSuppliers: SupplierInterface[] = [];
  public filteredSuppliers: SupplierInterface[] = [];
  public searchTerm: string = '';
  public isLoading: boolean = false;
  public currentCmpUuid: string = '';
 
  // Control del Drawer (Ficha Técnica)
  public selectedSupplier: SupplierInterface | null = null;
  public isDrawerVisible = false;
 
  constructor(
    private _suppliersService: SuppliersService,
    private _sessionService: SessionService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    this.currentCmpUuid = company.cmp_uuid;
    this.loadSuppliers(this.currentCmpUuid);
  }

  public loadSuppliers(cmp_uuid: string): void {
    this.isLoading = true;
    this._suppliersService.getSuppliers(cmp_uuid).subscribe((res: any) => {
      this.isLoading = false;
      this.allSuppliers = res.data || [];
      this.applyFilters();
    }, () => {
      this.isLoading = false;
    });
  }

  // --- BUSCADOR ---

  public applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSuppliers = [...this.allSuppliers];
      return;
    }
 
    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.allSuppliers.filter(s =>
      s.sup_fullname?.toLowerCase().includes(term) ||
      s.sup_email?.toLowerCase().includes(term) ||
      s.sup_phone?.includes(term)
    );
  }

  // --- DRAWER ---

  public openSupplierProfile(supplier: SupplierInterface): void {
    this.selectedSupplier = supplier;
    this.isDrawerVisible = true;
  }
 
  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedSupplier = null, 300);
  }

  public editSupplier(sup_uuid: string): void {
    this._router.navigate(['application/supplier', sup_uuid]);
  }

  public addSupplier(): void {
    this._router.navigate(['application/supplier', 'new']);
  }

}
