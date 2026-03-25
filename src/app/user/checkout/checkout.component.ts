import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AddressesService } from '../../core/services/addresses.service';
import { AddressInterface } from '../../core/interfaces/address/address.interface';
import { Subscription } from 'rxjs';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzStepsModule,
    NzIconModule,
    NzRadioModule,
    NzDividerModule,
    NzAlertModule,
    NzSelectModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {

  public shippingForm!: FormGroup;
  public totalFinal: number = 0;
  public cartItemCount: number = 0;
  public cartItemsList: any[] = [];

  private cartSub!: Subscription;
  private adrSub!: Subscription;

  // Direcciones
  public myAddresses: AddressInterface[] = [];
  public selectedAddressId: string = 'new';
  public showNewAddressForm: boolean = true;

  // Estado del Wizard
  public currentStep = 1; // 0 = Carrito(router), 1 = Envío, 2 = Pago, 3 = Confirmación

  // Pago
  public paymentMethod: 'transfer' | 'card' = 'transfer';
  public transactionId: string = '';
  public isProcessingPayment = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private addressesService: AddressesService,
    private message: NzMessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 0. Cargar Libreta de Direcciones
    this.adrSub = this.addressesService.addresses$.subscribe((list: AddressInterface[]) => {
      this.myAddresses = list;
      if (this.myAddresses.length > 0) {
        this.selectedAddressId = this.myAddresses[0].adr_uuid;
        this.showNewAddressForm = false;
      }
    });

    // 1. Setup Envío
    this.shippingForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });

    // 2. Traer Datos del Carrito
    this.cartSub = this.cartService.cartItems$.subscribe((cartItems: any[]) => {
      this.cartItemsList = cartItems;
      this.cartItemCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      this.totalFinal = cartItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);

      if (this.cartItemCount === 0 && this.currentStep < 3) {
        this.message.warning('Tu carrito está vacío, serás redirigido al catálogo.');
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
    if (this.adrSub) {
      this.adrSub.unsubscribe();
    }
  }

  // --- MÉTODOS DE LA VISTA ---

  public onAddressSelectionChange(value: string): void {
    this.showNewAddressForm = (value === 'new');
  }

  // --- NAVEGACIÓN ENTRE PASOS ---

  public goToPaymentStep(): void {
    if (this.selectedAddressId !== 'new') {
      // Se seleccionó una dirección guardada
      this.currentStep = 2;
      return;
    }

    if (this.shippingForm.valid) {
      // Guardar la nueva dirección en la libreta si la escribió a mano
      this.addressesService.addAddress(this.shippingForm.value);
      this.currentStep = 2; // Avanzar a método de pago
    } else {
      Object.values(this.shippingForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Por favor completá todos los campos obligatorios de envío.');
    }
  }

  public goToShippingStep(): void {
    this.currentStep = 1; // Volver atrás a edición de envío
  }

  // --- PROCESAMIENTO FINAL ---

  public submitOrderPayment(): void {
    if (this.paymentMethod === 'transfer' && !this.transactionId.trim()) {
      this.message.error('Debés ingresar el N° de Comprobante de la transferencia para continuar.');
      return;
    }

    this.isProcessingPayment = true;

    // Simulamos un delay de comunicación con API Bancaria / Base de Datos
    setTimeout(() => {
      this.isProcessingPayment = false;
      this.currentStep = 3; // Mostrar pantalla de éxito

      // Vaciar carrito
      this.cartService.clearCart();

      this.message.success('¡Compra confirmada con éxito!');
    }, 2500);
  }
}
