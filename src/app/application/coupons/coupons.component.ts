import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest, BehaviorSubject, switchMap } from 'rxjs';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { SessionService } from '@services/session.service';
import { CouponsService } from '@services/coupons.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzTagModule,
    NzInputModule,
    NzFormModule,
    NzSpinModule,
    NzSelectModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzInputNumberModule
  ],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent implements OnInit {

  public cmp_uuid!: string;
  public couponForm!: FormGroup;
  
  // Reactive streams
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredCoupons$!: Observable<any[]>;

  // Drawer Control
  public selectedCoupon: any = null;
  public isDrawerVisible = false;
  public isEditing = false;
  public isLoading = false;

  constructor(
    private fb: FormBuilder,
    private _sessionService: SessionService,
    private _couponsService: CouponsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    // Form Initialization
    this.couponForm = this.fb.group({
      cmp_uuid: [this.cmp_uuid],
      cou_uuid: [''],
      cou_code: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')]],
      cou_type: ['PERCENTAGE', [Validators.required]],
      cou_value: [null, [Validators.required, Validators.min(0.01)]],
      cou_minpurchase: [0, [Validators.required, Validators.min(0)]],
      cou_maxdiscount: [0, [Validators.min(0)]],
      cou_startdate: [null, [Validators.required]],
      cou_enddate: [null, [Validators.required]],
      cou_limit: [100, [Validators.required, Validators.min(1)]],
      cou_active: [true]
    });

    // Reactive table search and list reload
    this.filteredCoupons$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._couponsService.getCoupons(this.cmp_uuid))
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const coupons = results.data || [];
        if (!term.trim()) return coupons;
        
        const lowTerm = term.toLowerCase();
        return coupons.filter((cou: any) => 
          cou.cou_code.toLowerCase().includes(lowTerm)
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openCreateDrawer(): void {
    this.selectedCoupon = null;
    this.isEditing = true;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 días de vigencia por defecto
    
    this.couponForm.reset({
      cmp_uuid: this.cmp_uuid,
      cou_uuid: '',
      cou_code: '',
      cou_type: 'PERCENTAGE',
      cou_value: null,
      cou_minpurchase: 0,
      cou_maxdiscount: 0,
      cou_startdate: startDate,
      cou_enddate: endDate,
      cou_limit: 100,
      cou_active: true
    });
    this.isDrawerVisible = true;
  }

  public openCouponDetail(coupon: any): void {
    this.selectedCoupon = coupon;
    this.isEditing = false;
    this.couponForm.patchValue({
      ...coupon,
      cou_startdate: new Date(coupon.cou_startdate),
      cou_enddate: new Date(coupon.cou_enddate)
    });
    this.isDrawerVisible = true;
  }

  public enableEditing(): void {
    this.isEditing = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => {
      this.selectedCoupon = null;
      this.isEditing = false;
    }, 300);
  }

  public onSave(): void {
    if (this.couponForm.valid) {
      const data = this.couponForm.value;
      const cou_uuid = data.cou_uuid;

      // Validar coherencia de fechas
      const start = new Date(data.cou_startdate).getTime();
      const end = new Date(data.cou_enddate).getTime();
      if (start > end) {
        this._messageService.error('Error de Fechas', 'La fecha de inicio no puede ser posterior a la fecha de vencimiento.');
        return;
      }

      this.isLoading = true;

      // Asegurarse de que el código esté en mayúsculas
      data.cou_code = data.cou_code.toUpperCase().trim();

      const request$ = cou_uuid
        ? this._couponsService.updateCoupon(data)
        : this._couponsService.saveCoupon(data);

      request$.subscribe({
        next: () => {
          const successMsg = cou_uuid
            ? 'El cupón ha sido actualizado correctamente.'
            : 'El cupón ha sido creado exitosamente.';

          this._messageService.success('¡Éxito!', successMsg);
          this.isLoading = false;
          this.closeDrawer();
          this.refreshData$.next(); // Reload table
        },
        error: (err) => {
          console.error(err);
          this._messageService.error('Error', err.error?.error || 'Hubo un problema al guardar el cupón.');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.couponForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public onDeleteCoupon(coupon: any): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente el cupón: ${coupon.cou_code}`,
      () => {
        this.isLoading = true;
        this._couponsService.deleteCoupon(this.cmp_uuid, coupon.cou_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'El cupón ha sido eliminado correctamente.');
            this.isLoading = false;
            this.closeDrawer();
            this.refreshData$.next(); // Reload table
          },
          error: (err) => {
            console.error(err);
            this._messageService.error('Error', err.error?.error || 'No se pudo eliminar el cupón.');
            this.isLoading = false;
          }
        });
      }
    );
  }
}
