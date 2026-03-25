import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AddressInterface } from '../../core/interfaces/address/address.interface';
import { AddressesService } from '../../core/services/addresses.service';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzPopconfirmModule
  ],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss'
})
export class AddressesComponent implements OnInit, OnDestroy {

  public addresses: AddressInterface[] = [];
  private adrSub!: Subscription;

  // Modal Control
  public isModalVisible = false;
  public addressForm!: FormGroup;

  constructor(
    private addressesService: AddressesService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // 1. Suscribirse a la libreta de direcciones
    this.adrSub = this.addressesService.addresses$.subscribe(list => {
      this.addresses = list;
    });

    // 2. Inicializar Formulario
    this.addressForm = this.fb.group({
      adr_alias: ['Casa', [Validators.required]],
      adr_recipientname: ['', [Validators.required]],
      adr_contactphone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      adr_address: ['', [Validators.required]],
      adr_reference: [''],
      adr_city: ['', [Validators.required]],
      adr_province: ['', [Validators.required]],
      adr_postalcode: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    if (this.adrSub) {
      this.adrSub.unsubscribe();
    }
  }

  // --- MÉTODOS DE VISTA ---

  public removeAddress(uuid: string): void {
    this.addressesService.removeAddress(uuid);
    this.message.success('Domicilio eliminado de la libreta.');
  }

  public openCreateModal(): void {
    this.addressForm.reset({ adr_alias: 'Casa' });
    this.isModalVisible = true;
  }

  public closeModal(): void {
    this.isModalVisible = false;
  }

  public submitNewAddress(): void {
    if (this.addressForm.valid) {
      this.addressesService.addAddress({
        adr_alias: this.addressForm.value.adr_alias,
        adr_recipientname: this.addressForm.value.adr_recipientname,
        adr_contactphone: this.addressForm.value.adr_contactphone,
        adr_reference: this.addressForm.value.adr_reference,
        adr_address: this.addressForm.value.adr_address,
        adr_city: this.addressForm.value.adr_city,
        adr_province: this.addressForm.value.adr_province,
        adr_postalcode: this.addressForm.value.adr_postalcode
      });
      this.message.success('¡Nueva dirección guardada!');
      this.closeModal();
    } else {
      Object.values(this.addressForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Por favor completá los campos obligatorios.');
    }
  }
}
