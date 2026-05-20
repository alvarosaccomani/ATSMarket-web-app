import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AddressesService } from '../../core/services/addresses.service';
import { AddressInterface } from '../../core/interfaces/address/address.interface';
import { Subscription } from 'rxjs';
import { OrdersService } from '../../core/services/orders.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { SessionService } from '../../core/services/session.service';
import { CustomersService } from '../../core/services/customers.service';

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
  private storeSub!: Subscription;

  public currentCompany: any = null;

  // Direcciones
  public myAddresses: AddressInterface[] = [];
  public selectedAddressId: string = 'new';
  public showNewAddressForm: boolean = true;
  public hasCustomer: boolean = false;

  // Estado del Wizard
  public currentStep = 1; // 0 = Carrito(router), 1 = Envío, 2 = Pago, 3 = Confirmación

  // Pago
  public paymentMethod: 'transfer' | 'card' = 'transfer';
  public transactionId: string = '';
  public isProcessingPayment = false;
  public generatedOrderNumber: number = 0;

  // Envíos y Modalidades
  public shippingMethod: 'moto' | 'correo' | 'retiro' | 'acordar' = 'correo';
  public shippingCost: number = 0;
  public isLocalDeliveryAvailable: boolean = false;
  public totalSubtotal: number = 0;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private addressesService: AddressesService,
    private message: NzMessageService,
    private router: Router,
    private ordersService: OrdersService,
    public storeContext: StoreContextService,
    private _sessionService: SessionService,
    private _customersService: CustomersService
  ) { }

  ngOnInit(): void {
    // 0. Cargar Tienda Actual
    this.storeSub = this.storeContext.activeStore$.subscribe(company => {
      this.currentCompany = company;
      this.checkShippingEligibility();
    });

    // 0.3 Determinar si hay cliente cargado en sesión
    const customer = this._sessionService.getCustomer();
    this.hasCustomer = !!customer;

    // 0.4 Cargar Direcciones Reales del Servidor
    const cusUuid = customer ? customer.cus_uuid : 'guest-customer';
    this.addressesService.getAddressesByCustomer(cusUuid);

    // 0.5 Suscribirse a la Libreta de Direcciones
    this.adrSub = this.addressesService.addresses$.subscribe((list: AddressInterface[]) => {
      this.myAddresses = list;
      if (this.myAddresses.length > 0) {
        this.selectedAddressId = this.myAddresses[0].adr_uuid;
        this.showNewAddressForm = false;
        this.checkShippingEligibility();
      }
    });

    // 1. Setup Envío
    this.shippingForm = this.fb.group({
      nombre: ['', this.hasCustomer ? [] : [Validators.required]],
      apellido: ['', this.hasCustomer ? [] : [Validators.required]],
      direccion: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[+0-9\\s\\-()]*$')]]
    });

    this.shippingForm.get('ciudad')?.valueChanges.subscribe(() => {
      this.checkShippingEligibility();
    });

    // 2. Traer Datos del Carrito
    this.cartSub = this.cartService.cartItems$.subscribe((cartItems: any[]) => {
      this.cartItemsList = cartItems;
      this.cartItemCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      this.totalSubtotal = cartItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);
      this.updateShippingCost();

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
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

  // --- MÉTODOS DE LA VISTA ---

  public onAddressSelectionChange(value: string): void {
    this.showNewAddressForm = (value === 'new');
    this.checkShippingEligibility();
  }

  // --- LÓGICA DE ENVÍO LOCAL VS NACIONAL ---

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public checkShippingEligibility(): void {
    if (!this.currentCompany) return;

    // Obtener parámetros de envío dinámicos configurados por la tienda
    const localRadius = Number(this.storeContext.getSetting('DELIVERY_LOCAL_RADIUS', 25));
    const localCost = Number(this.storeContext.getSetting('DELIVERY_LOCAL_COST', 350));
    const nationalCost = Number(this.storeContext.getSetting('DELIVERY_NATIONAL_COST', 800));

    let isLocal = false;

    if (this.selectedAddressId !== 'new') {
      const addr = this.myAddresses.find(a => a.adr_uuid === this.selectedAddressId);
      if (addr) {
        // 1. Intentar por coordenadas (Haversine)
        if (this.currentCompany.cmp_lat && this.currentCompany.cmp_lng && addr.adr_lat && addr.adr_lng) {
          const dist = this.calculateDistance(
            this.currentCompany.cmp_lat, this.currentCompany.cmp_lng,
            addr.adr_lat, addr.adr_lng
          );
          isLocal = dist <= localRadius;
        } else {
          // 2. Fallback por coincidencia de texto de ciudad
          const compAddress = (this.currentCompany.cmp_address || '').toLowerCase();
          const addrCity = (addr.adr_city || '').toLowerCase().trim();
          if (addrCity && compAddress.includes(addrCity)) {
            isLocal = true;
          }
        }
      }
    } else {
      // Dirección Nueva: comparar el input del formulario
      const formCity = (this.shippingForm.get('ciudad')?.value || '').toLowerCase().trim();
      const compAddress = (this.currentCompany.cmp_address || '').toLowerCase();
      if (formCity && compAddress.includes(formCity)) {
        isLocal = true;
      }
    }

    this.isLocalDeliveryAvailable = isLocal;
    
    const motoEnabled = this.storeContext.getSetting('SHIPPING_LOCAL_MOTO_ENABLE', 'true') === 'true';
    const correoEnabled = this.storeContext.getSetting('SHIPPING_NATIONAL_CORREO_ENABLE', 'true') === 'true';
    const retiroEnabled = this.storeContext.getSetting('SHIPPING_RETIRO_LOCAL_ENABLE', 'true') === 'true';
    const acordarEnabled = this.storeContext.getSetting('SHIPPING_ACORDAR_VENDEDOR_ENABLE', 'true') === 'true';

    // Verificar si el actual seleccionado sigue siendo válido
    let currentValid = false;
    if (this.shippingMethod === 'moto' && motoEnabled && this.isLocalDeliveryAvailable) currentValid = true;
    if (this.shippingMethod === 'correo' && correoEnabled) currentValid = true;
    if (this.shippingMethod === 'retiro' && retiroEnabled) currentValid = true;
    if (this.shippingMethod === 'acordar' && acordarEnabled) currentValid = true;

    if (!currentValid) {
      // Intentar reasignar a una opción válida por prioridad
      if (correoEnabled) {
        this.shippingMethod = 'correo';
      } else if (retiroEnabled) {
        this.shippingMethod = 'retiro';
      } else if (acordarEnabled) {
        this.shippingMethod = 'acordar';
      } else if (motoEnabled && this.isLocalDeliveryAvailable) {
        this.shippingMethod = 'moto';
      } else {
        // Fallback final: si ninguno es elegible, asignamos el primero habilitado por el comercio
        if (motoEnabled) {
          this.shippingMethod = 'moto';
        } else if (retiroEnabled) {
          this.shippingMethod = 'retiro';
        } else {
          this.shippingMethod = 'acordar';
        }
      }
    }

    this.updateShippingCost(localCost, nationalCost);
  }

  public updateShippingCost(localCost?: number, nationalCost?: number): void {
    const lCost = localCost !== undefined ? localCost : Number(this.storeContext.getSetting('DELIVERY_LOCAL_COST', 350));
    const nCost = nationalCost !== undefined ? nationalCost : Number(this.storeContext.getSetting('DELIVERY_NATIONAL_COST', 800));

    if (this.shippingMethod === 'moto') {
      this.shippingCost = lCost;
    } else if (this.shippingMethod === 'correo') {
      this.shippingCost = nCost;
    } else {
      // 'retiro' o 'acordar'
      this.shippingCost = 0;
    }
    this.totalFinal = this.totalSubtotal + this.shippingCost;
  }

  public setShippingMethod(method: 'moto' | 'correo' | 'retiro' | 'acordar'): void {
    this.shippingMethod = method;
    this.updateShippingCost();
  }

  // --- NAVEGACIÓN ENTRE PASOS ---

  public goToPaymentStep(): void {
    if (this.selectedAddressId !== 'new') {
      // Se seleccionó una dirección guardada
      this.currentStep = 2;
      return;
    }

    if (this.shippingForm.valid) {
      const val = this.shippingForm.value;
      const customer = this._sessionService.getCustomer();
      const identity = this._sessionService.getIdentity();

      if (!customer && identity) {
        // No existe cliente en sesión pero sí un usuario logueado. Creamos el cliente antes de proceder.
        const newCustomerPayload = {
          usr_uuid: identity.usr_uuid,
          cus_uuid: 'new',
          cus_fullname: `${val.nombre} ${val.apellido}`,
          cus_email: identity.usr_email || '',
          cus_phone: val.telefono
        };

        this._customersService.saveCustomer(newCustomerPayload).subscribe({
          next: (customerRes) => {
            if (customerRes && customerRes.data) {
              // Guardar el cliente retornado en el local storage / sesión
              this._sessionService.setCustomer(customerRes.data);
              this.hasCustomer = true;

              // Proceder a guardar la dirección vinculada al cliente recién creado
              this.proceedWithAddAddress(val, customerRes.data);
            } else {
              this.message.error('No se pudo procesar la creación de tu perfil de cliente.');
            }
          },
          error: (err) => {
            console.error('Error al registrar cliente:', err);
            this.message.error('No se pudo registrar la información de cliente. Intentá nuevamente.');
          }
        });
      } else {
        // El cliente ya existe o compra como invitado
        this.proceedWithAddAddress(val, customer);
      }
    } else {
      const invalidFields: string[] = [];
      Object.keys(this.shippingForm.controls).forEach(key => {
        const control = this.shippingForm.get(key);
        if (control && control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
          invalidFields.push(key);
        }
      });
      console.warn('Campos de envío inválidos:', invalidFields);
      this.message.error(`Por favor completá todos los campos obligatorios de envío. Inválidos: ${invalidFields.join(', ')}`);
    }
  }

  private proceedWithAddAddress(val: any, customer: any): void {
    const newAddressData: Partial<AddressInterface> = {
      cus_uuid: customer ? customer.cus_uuid : 'guest-customer',
      adr_alias: 'Mi Domicilio',
      adr_recipientname: customer ? customer.cus_fullname : `${val.nombre} ${val.apellido}`,
      adr_address: val.direccion,
      adr_city: val.ciudad,
      adr_province: val.provincia,
      adr_postalcode: val.codigoPostal,
      adr_contactphone: val.telefono,
      adr_country: 'Argentina'
    };

    this.addressesService.saveAddress(newAddressData).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.selectedAddressId = res.data.adr_uuid;
        }
        this.currentStep = 2; // Avanzar a método de pago
      },
      error: (err) => {
        console.error('Error al guardar la dirección:', err);
        this.message.error('No se pudo guardar la dirección. Por favor, intentá nuevamente.');
      }
    });
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

    if (!this.currentCompany) {
      this.message.error('Error: No se pudo identificar la tienda actual.');
      return;
    }

    this.isProcessingPayment = true;

    let methodText = '';
    if (this.shippingMethod === 'moto') {
      methodText = 'Motomensajería Local';
    } else if (this.shippingMethod === 'correo') {
      methodText = 'Correo Postal Nacional';
    } else if (this.shippingMethod === 'retiro') {
      methodText = 'Retiro en el Local (Gratis)';
    } else {
      methodText = 'Acordar con el Vendedor';
    }
    const notes = `[Envío: ${methodText} ($${this.shippingCost})] | Método de pago: ${this.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Tarjeta / Online'}. Comprobante: ${this.transactionId}`;
    const orderNumber = Math.floor(Math.random() * 90000) + 10000;
    this.generatedOrderNumber = orderNumber;

    const customer = this._sessionService.getCustomer();
    const identity = this._sessionService.getIdentity();

    const payload = {
      cmp_uuid: this.currentCompany.cmp_uuid,
      usr_uuid: identity ? identity.usr_uuid : 'guest',
      cus_uuid: customer ? customer.cus_uuid : 'guest-customer',
      adr_uuid: this.selectedAddressId,
      ord_ordernumber: orderNumber,
      ord_status: 'PENDING',
      ord_date: new Date(),
      ord_subtotal: this.totalSubtotal,
      ord_shippingcost: this.shippingCost,
      ord_tax: 0,
      ord_total: this.totalFinal,
      ord_customernotes: notes,
      ord_trackingnumber: ''
    };

    this.ordersService.saveOrder(payload).subscribe({
      next: (res: any) => {
        this.isProcessingPayment = false;
        this.currentStep = 3; // Mostrar pantalla de éxito
        this.cartService.clearCart();
        this.message.success('¡Compra confirmada con éxito!');
      },
      error: (err: any) => {
        this.isProcessingPayment = false;
        this.message.error('No se pudo procesar tu compra. Por favor, intentá nuevamente.');
        console.error('Error al crear orden:', err);
      }
    });
  }
}
