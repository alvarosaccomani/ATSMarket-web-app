import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { SuppliersService } from '@services/suppliers.service';
import { SessionService } from '@services/session.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzDividerModule,
    NzSpaceModule
  ],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss'
})
export class SupplierComponent implements OnInit {

  public supplierForm!: FormGroup;
  public isLoading: boolean = false;
  public currentCmpUuid: string = '';

  constructor(
    private fb: FormBuilder,
    private _suppliersService: SuppliersService,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.supplierForm = this.fb.group({
      cmp_uuid: ['', [Validators.required]],
      sup_uuid: [null],
      sup_fullname: ['', [Validators.required]],
      sup_email: ['', [Validators.email]],
      sup_phone: [''],
      pmt_uuid: [null], // Término de pago (opcional por ahora)
      usr_uuid: [null]
    });

    const company = this._sessionService.getCompany();
    this.currentCmpUuid = company.cmp_uuid;
    
    this.supplierForm.patchValue({
      cmp_uuid: this.currentCmpUuid
    });

    this._route.params.subscribe(params => {
      if (params['sup_uuid'] && params['sup_uuid'] !== 'new') {
        this.getSupplierById(this.currentCmpUuid, params['sup_uuid']);
      }
    });
  }

  private getSupplierById(cmp_uuid: string, sup_uuid: string): void {
    this.isLoading = true;
    this._suppliersService.getSupplierById(cmp_uuid, sup_uuid).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.supplierForm.patchValue(res.data);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error(error);
      }
    );
  }

  public onSave(): void {
    if (this.supplierForm.valid) {
      this.isLoading = true;
      const supplierData = this.supplierForm.value;

      if (supplierData.sup_uuid) {
        this.updateSupplier(supplierData);
      } else {
        this.insertSupplier(supplierData);
      }
    } else {
      Object.values(this.supplierForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private insertSupplier(data: any): void {
    this._suppliersService.saveSupplier(data).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this._messageService.success("Éxito", "Proveedor creado correctamente.", () => {
            this._router.navigate(['/application/suppliers']);
          });
        }
      },
      (error) => {
        this.isLoading = false;
        this._messageService.error("Error", "No se pudo crear el proveedor.");
      }
    );
  }

  private updateSupplier(data: any): void {
    this._suppliersService.updateSupplier(data).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this._messageService.success("Éxito", "Proveedor actualizado correctamente.", () => {
            this._router.navigate(['/application/suppliers']);
          });
        }
      },
      (error) => {
        this.isLoading = false;
        this._messageService.error("Error", "No se pudo actualizar el proveedor.");
      }
    );
  }

  public onCancel(): void {
    this.location.back();
  }

}
