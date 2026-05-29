import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AddressesService } from '../../core/services/addresses.service';
import { AddressInterface } from '../../core/interfaces/address/address.interface';
import { OrderDetailInterface } from '../../core/interfaces/order-detail/order-detail.interface';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OrdersService } from '../../core/services/orders.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { SessionService } from '../../core/services/session.service';
import { CustomersService } from '../../core/services/customers.service';
import { MessageService } from '../../core/services/message.service';
import { StockMovementsService } from '../../core/services/stock-movements.service';
import { ProductVariationsService } from '../../core/services/product-variations.service';
import { InventoryStocksService } from '../../core/services/inventory-stocks.service';

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
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
    NzSelectModule,
    NzSpinModule
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

  // Simulación de Tarjeta Premium
  public cardName: string = '';
  public cardNumber: string = '';
  public cardExpiry: string = '';
  public cardCvv: string = '';
  public isCardFlipped: boolean = false;
  public cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic' = 'generic';
  public processingMessage: string = '';

  // Logística Postal Dinámica
  public isCalculatingShipping: boolean = false;
  public postalOptions: any[] = [];
  public selectedPostalOptionId: 'correo_std' | 'correo_exp' | 'correo_priority' = 'correo_std';

  // --- FORMATEO Y MÁSCARAS DE TARJETA ---

  public formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Eliminar todo excepto dígitos
    
    // Auto-detectar marca de tarjeta
    if (input.startsWith('4')) {
      this.cardBrand = 'visa';
    } else if (input.startsWith('5') || /^5[1-5]/.test(input)) {
      this.cardBrand = 'mastercard';
    } else if (input.startsWith('3')) {
      this.cardBrand = 'amex';
    } else if (input.startsWith('6')) {
      this.cardBrand = 'discover';
    } else {
      this.cardBrand = 'generic';
    }

    // Limitar longitud según marca
    const maxLength = this.cardBrand === 'amex' ? 15 : 16;
    input = input.substring(0, maxLength);

    // Formatear con espacios cada 4 dígitos (o 4-6-5 para AMEX)
    let formatted = '';
    if (this.cardBrand === 'amex') {
      const part1 = input.substring(0, 4);
      const part2 = input.substring(4, 10);
      const part3 = input.substring(10, 15);
      formatted = [part1, part2, part3].filter(Boolean).join(' ');
    } else {
      const parts = [];
      for (let i = 0; i < input.length; i += 4) {
        parts.push(input.substring(i, i + 4));
      }
      formatted = parts.join(' ');
    }

    this.cardNumber = formatted;
    event.target.value = formatted;
  }

  public formatExpiry(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Solo números
    input = input.substring(0, 4);

    if (input.length > 2) {
      this.cardExpiry = input.substring(0, 2) + '/' + input.substring(2, 4);
    } else {
      this.cardExpiry = input;
    }
    event.target.value = this.cardExpiry;
  }

  public formatCvv(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Solo números
    const maxLength = this.cardBrand === 'amex' ? 4 : 3;
    this.cardCvv = input.substring(0, maxLength);
    event.target.value = this.cardCvv;
  }

  public setCardFocus(isFocused: boolean): void {
    this.isCardFlipped = isFocused;
  }

  // Envíos y Modalidades
  public shippingMethod: 'moto' | 'correo' | 'retiro' | 'acordar' = 'correo';
  public shippingCost: number = 0;
  public isLocalDeliveryAvailable: boolean = false;
  public totalSubtotal: number = 0;

  // Geolocalización y Autocompletado
  public isDetectingLocation: boolean = false;
  public detectedCoords: { lat: number, lng: number } | null = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private addressesService: AddressesService,
    private message: NzMessageService,
    private router: Router,
    private ordersService: OrdersService,
    public storeContext: StoreContextService,
    private _sessionService: SessionService,
    private _customersService: CustomersService,
    private _messageService: MessageService,
    private _stockMovementsService: StockMovementsService,
    private _productVariationsService: ProductVariationsService,
    private _inventoryStocksService: InventoryStocksService
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
      telefono: [customer ? customer.cus_phone : '', [Validators.required, Validators.pattern('^[+0-9\\s\\-()]*$')]]
    });

    this.shippingForm.get('ciudad')?.valueChanges.subscribe(() => {
      this.checkShippingEligibility();
    });

    this.shippingForm.get('codigoPostal')?.valueChanges.subscribe(() => {
      this.checkShippingEligibility();
      this.calculatePostalShippingRates();
    });

    // 2. Traer Datos del Carrito
    this.cartSub = this.cartService.cartItems$.subscribe((cartItems: any[]) => {
      this.cartItemsList = cartItems;
      this.cartItemCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      this.totalSubtotal = cartItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);
      this.updateShippingCost();
      this.calculatePostalShippingRates();

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
    if (value !== 'new') {
      this.detectedCoords = null;
    }
    this.checkShippingEligibility();
    this.calculatePostalShippingRates();
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
      // Dirección Nueva: usar coordenadas si fueron detectadas
      if (this.currentCompany.cmp_lat && this.currentCompany.cmp_lng && this.detectedCoords) {
        const dist = this.calculateDistance(
          this.currentCompany.cmp_lat, this.currentCompany.cmp_lng,
          this.detectedCoords.lat, this.detectedCoords.lng
        );
        isLocal = dist <= localRadius;
      } else {
        // Fallback por coincidencia de ciudad
        const formCity = (this.shippingForm.get('ciudad')?.value || '').toLowerCase().trim();
        const compAddress = (this.currentCompany.cmp_address || '').toLowerCase();
        if (formCity && compAddress.includes(formCity)) {
          isLocal = true;
        }
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

  public detectCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.message.error('La geolocalización no está soportada por tu navegador.');
      return;
    }

    this.isDetectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.detectedCoords = { lat, lng };

        // Realizar geocodificación reversa
        this.reverseGeocode(lat, lng);
      },
      (error) => {
        this.isDetectingLocation = false;
        this.message.error('No se pudo detectar tu ubicación. Por favor, ingresá los datos manualmente.');
        console.error('Error de geolocalización:', error);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        this.isDetectingLocation = false;
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || '';
          const houseNumber = addr.house_number || '';
          const city = addr.city || addr.town || addr.village || addr.suburb || '';
          const state = addr.state || '';
          const postcode = addr.postcode || '';

          // Actualizar el formulario reactivo
          this.shippingForm.patchValue({
            direccion: `${road} ${houseNumber}`.trim(),
            ciudad: city,
            provincia: state,
            codigoPostal: postcode
          });

          this.message.success('📍 Ubicación detectada y autocompletada.');
          
          // Re-calcular la elegibilidad de envío con las nuevas coordenadas y ciudad
          this.checkShippingEligibility();
        } else {
          this.message.warning('Ubicación detectada, pero no pudimos autocompletar la dirección. Rellénala manualmente.');
          this.checkShippingEligibility();
        }
      })
      .catch(err => {
        this.isDetectingLocation = false;
        console.error('Error en geocodificación reversa:', err);
        this.message.warning('Ubicación detectada, pero falló el servicio de traducción. Rellena los campos manualmente.');
        this.checkShippingEligibility();
      });
  }

  public updateShippingCost(localCost?: number, nationalCost?: number): void {
    const lCost = localCost !== undefined ? localCost : Number(this.storeContext.getSetting('DELIVERY_LOCAL_COST', 350));
    const nCost = nationalCost !== undefined ? nationalCost : Number(this.storeContext.getSetting('DELIVERY_NATIONAL_COST', 800));

    if (this.shippingMethod === 'moto') {
      this.shippingCost = lCost;
    } else if (this.shippingMethod === 'correo') {
      if (this.postalOptions.length > 0) {
        const option = this.postalOptions.find(o => o.id === this.selectedPostalOptionId) || this.postalOptions[0];
        this.shippingCost = option.cost;
      } else {
        this.shippingCost = nCost;
      }
    } else {
      this.shippingCost = 0;
    }
    this.totalFinal = this.totalSubtotal + this.shippingCost;
  }

  public setShippingMethod(method: 'moto' | 'correo' | 'retiro' | 'acordar'): void {
    this.shippingMethod = method;
    if (method === 'correo') {
      this.calculatePostalShippingRates();
    } else {
      this.updateShippingCost();
    }
  }

  public calculatePostalShippingRates(): void {
    const postcode = this.selectedAddressId !== 'new'
      ? this.myAddresses.find(a => a.adr_uuid === this.selectedAddressId)?.adr_postalcode || ''
      : this.shippingForm.get('codigoPostal')?.value || '';

    if (this.cartItemsList.length === 0 || !postcode.trim()) {
      this.postalOptions = [];
      return;
    }

    this.isCalculatingShipping = true;

    // Calcular peso y volumen simulados
    const totalWeight = this.cartItemsList.reduce((sum, item) => sum + (item.quantity * 0.45), 0); // 0.45 kg promedio
    const totalVolume = this.cartItemsList.reduce((sum, item) => sum + (item.quantity * 1200), 0); // 1200 cm3 promedio

    // Calcular factor de zona según código postal (primer dígito)
    const firstDigit = postcode.trim().replace(/\D/g, '').substring(0, 1);
    let zoneMultiplier = 1.3;
    if (['1', '2'].includes(firstDigit)) {
      zoneMultiplier = 1.0; // Centro / Buenos Aires / CABA
    } else if (['3', '4'].includes(firstDigit)) {
      zoneMultiplier = 1.25; // Centro-Oeste / Litoral
    } else if (['5', '6'].includes(firstDigit)) {
      zoneMultiplier = 1.55; // Norte / Cuyo
    } else if (['7', '8', '9'].includes(firstDigit)) {
      zoneMultiplier = 1.95; // Patagonia profunda / Sur
    }

    // Simular llamada de 850ms al cotizador postal
    setTimeout(() => {
      const costStd = Math.round((600 + (totalWeight * 140) + (totalVolume * 0.04)) * zoneMultiplier);
      const costExp = Math.round((950 + (totalWeight * 200) + (totalVolume * 0.07)) * zoneMultiplier);
      const costPriority = Math.round((1450 + (totalWeight * 310) + (totalVolume * 0.11)) * zoneMultiplier);

      this.postalOptions = [
        {
          id: 'correo_std',
          providerName: 'Correo Argentino Standard',
          description: 'Despacho ordinario y económico directo a domicilio o sucursal.',
          cost: costStd,
          estimatedDays: '3 a 5 días hábiles',
          icon: 'global'
        },
        {
          id: 'correo_exp',
          providerName: 'Andreani Express',
          description: 'Envío prioritario con seguimiento activo en tiempo real.',
          cost: costExp,
          estimatedDays: '1 a 2 días hábiles',
          icon: 'rocket'
        },
        {
          id: 'correo_priority',
          providerName: 'DHL Priority (Express 24h)',
          description: 'Entrega urgente garantizada al siguiente día hábil antes de las 14:00.',
          cost: costPriority,
          estimatedDays: '24 horas hábiles',
          icon: 'thunderbolt'
        }
      ];

      this.isCalculatingShipping = false;

      // Asegurar que la opción seleccionada exista
      const currentOption = this.postalOptions.find(o => o.id === this.selectedPostalOptionId) || this.postalOptions[0];
      this.selectedPostalOptionId = currentOption.id;

      // Actualizar costos de envío en el checkout
      this.updateShippingCost();
    }, 850);
  }

  public selectPostalOption(optionId: 'correo_std' | 'correo_exp' | 'correo_priority'): void {
    this.selectedPostalOptionId = optionId;
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
              this.proceedWithAddAddress(val, customerRes.data, true);
            } else {
              this.message.error('No se pudo procesar la creación de tu perfil de cliente.');
            }
          },
          error: (err) => {
            console.error('Error al registrar cliente:', err);
            this.message.error('No se pudo registrar la información de cliente. Intentá nuevamente.');
          }
        });
      } else if (customer) {
        // El cliente ya existe
        // Preguntar si desea guardar la dirección en su cuenta
        this._messageService.confirm(
          '¿Deseás guardar esta dirección?',
          '¿Querés registrar esta dirección en tu cuenta para futuras compras?',
          () => {
            // Dijo que SÍ: Guardar la dirección vinculada a su cuenta usando su teléfono almacenado
            this.proceedWithAddAddress(val, customer, true);
          },
          () => {
            // Dijo que NO: Guardar de manera temporal sin vincular a su cuenta
            this.proceedWithAddAddress(val, customer, false);
          },
          'Sí, guardar',
          'No, usar solo esta vez'
        );
      } else {
        // Compra como invitado sin cliente cargado
        this.proceedWithAddAddress(val, null, false);
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

  private proceedWithAddAddress(val: any, customer: any, saveToProfile: boolean = true): void {
    const newAddressData: Partial<AddressInterface> = {
      cus_uuid: (customer && saveToProfile) ? customer.cus_uuid : 'guest-customer',
      adr_alias: 'Mi Domicilio',
      adr_recipientname: customer ? customer.cus_fullname : `${val.nombre} ${val.apellido}`,
      adr_address: val.direccion,
      adr_city: val.ciudad,
      adr_province: val.provincia,
      adr_postalcode: val.codigoPostal,
      // Si se guarda en su perfil, tomamos el teléfono almacenado del cliente si existe, sino el del formulario
      adr_contactphone: (customer && saveToProfile && customer.cus_phone) ? customer.cus_phone : val.telefono,
      adr_country: 'Argentina',
      adr_lat: this.detectedCoords ? this.detectedCoords.lat : undefined,
      adr_lng: this.detectedCoords ? this.detectedCoords.lng : undefined
    };

    this.addressesService.saveAddress(newAddressData).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.selectedAddressId = res.data.adr_uuid;
          
          // Si no se guardó en el perfil, removemos de la lista local de la vista
          if (customer && !saveToProfile) {
            this.myAddresses = this.myAddresses.filter(a => a.adr_uuid !== res.data.adr_uuid);
          }
        }
        this.currentStep = 2; // Avanzar a método de pago
      },
      error: (err) => {
        console.error('Error al guardar la dirección:', err);
        this.message.error('No se pudo procesar la dirección. Por favor, intentá nuevamente.');
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

    if (this.paymentMethod === 'card') {
      if (!this.cardNumber.trim() || this.cardNumber.replace(/\s/g, '').length < 15) {
        this.message.error('Debés ingresar un número de tarjeta válido.');
        return;
      }
      if (!this.cardName.trim()) {
        this.message.error('Debés ingresar el nombre del titular de la tarjeta.');
        return;
      }
      if (!this.cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(this.cardExpiry)) {
        this.message.error('Debés ingresar una fecha de vencimiento válida (MM/YY).');
        return;
      }
      if (!this.cardCvv.trim() || this.cardCvv.length < 3) {
        this.message.error('Debés ingresar un código de seguridad (CVV) válido.');
        return;
      }
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
      const option = this.postalOptions.find(o => o.id === this.selectedPostalOptionId);
      methodText = option ? `Envío Postal (${option.providerName})` : 'Correo Postal Nacional';
    } else if (this.shippingMethod === 'retiro') {
      methodText = 'Retiro en el Local (Gratis)';
    } else {
      methodText = 'Acordar con el Vendedor';
    }

    const last4 = this.cardNumber.replace(/\s/g, '').slice(-4);
    const mockTxId = 'ch_stripe_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    let notes = '';
    if (this.paymentMethod === 'transfer') {
      notes = `[Envío: ${methodText} ($${this.shippingCost})] | Método de pago: Transferencia Bancaria. Comprobante: ${this.transactionId}`;
    } else {
      notes = `[Envío: ${methodText} ($${this.shippingCost})] | Método de pago: Tarjeta (${this.cardBrand.toUpperCase()} **** ${last4}). Transacción: ${mockTxId}`;
    }

    let trackingNumber = '';
    if (this.shippingMethod === 'correo') {
      const code = this.selectedPostalOptionId === 'correo_std' ? 'AR' : this.selectedPostalOptionId === 'correo_exp' ? 'AN' : 'DH';
      trackingNumber = `${code}-${Math.floor(Math.random() * 900000) + 100000}-GPS`;
    }

    const orderNumber = Math.floor(Math.random() * 90000) + 10000;
    this.generatedOrderNumber = orderNumber;

    const customer = this._sessionService.getCustomer();
    const identity = this._sessionService.getIdentity();

    const orderDetails: OrderDetailInterface[] = this.cartItemsList.map(item => ({
      cmp_uuid: item.cmp_uuid || this.currentCompany.cmp_uuid,
      ord_uuid: '',
      ordd_uuid: '',
      pro_uuid: item.pro_uuid,
      prov_uuid: item.prov_uuid,
      ordd_productname: item.prov_name || 'Producto ATSMarket',
      ordd_code: item.prov_code || '',
      ordd_sku: item.prov_sku || '',
      ordd_quantity: item.quantity,
      ordd_unitprice: item.prov_suggestedminimumsellingprice || 0,
      ordd_discount: 0,
      ordd_subtotal: item.subtotal || (item.quantity * (item.prov_suggestedminimumsellingprice || 0)),
      ordd_taxrate: 0,
      ordd_tax: 0,
      ordd_basecost: item.prov_suggestedminimumsellingprice || 0
    }));

    const payload = {
      cmp_uuid: this.currentCompany.cmp_uuid,
      usr_uuid: identity ? identity.usr_uuid : 'guest',
      cus_uuid: customer ? customer.cus_uuid : 'guest-customer',
      adr_uuid: this.selectedAddressId,
      ord_ordernumber: orderNumber,
      ords_uuid: this.paymentMethod === 'transfer' ? 'PENDING' : 'PROCESSING',
      ord_date: new Date(),
      ord_subtotal: this.totalSubtotal,
      ord_shippingcost: this.shippingCost,
      ord_tax: 0,
      ord_total: this.totalFinal,
      ord_customernotes: notes,
      ord_trackingnumber: trackingNumber,
      orderDetails: orderDetails
    };

    // --- CHECK STOCK EN CALIENTE ANTES DE PAGAR (CONSIDERANDO STOCK MULTI-DEPÓSITO) ---
    const stockChecks = this.cartItemsList.map(item => {
      const cmpUuid = item.cmp_uuid || this.currentCompany.cmp_uuid;
      const proUuid = item.pro_uuid;
      const provUuid = item.prov_uuid;

      // Consultamos el stock distribuido en tiempo real en todos los depósitos
      return this._inventoryStocksService.getStocksByVariation(cmpUuid, proUuid, provUuid).pipe(
        map((res: any) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const availableStock = res.data.reduce((sum: any, stock: any) => sum + (stock.ist_quanty - (stock.ist_quantyreserved || 0)), 0);
            return {
              item,
              availableStock,
              hasStock: availableStock >= item.quantity
            };
          }
          throw new Error('Sin stock detallado por depósito, usando fallback de variación');
        }),
        catchError(() => {
          return this._productVariationsService.checkStock(cmpUuid, proUuid, provUuid).pipe(
            map((res: any) => {
              let availableStock = 0;
              if (res && res.success && res.data !== undefined) {
                if (res.data && res.data.prov_stock !== undefined) {
                  availableStock = Number(res.data.prov_stock);
                } else if (typeof res.data === 'number') {
                  availableStock = res.data;
                }
              } else if (res && res.prov_stock !== undefined) {
                availableStock = Number(res.prov_stock);
              } else if (typeof res === 'number') {
                availableStock = res;
              }
              
              return {
                item,
                availableStock,
                hasStock: availableStock >= item.quantity
              };
            })
          );
        })
      );
    });

    if (stockChecks.length > 0) {
      forkJoin(stockChecks).subscribe({
        next: (results) => {
          const outOfStockItems = results.filter(r => !r.hasStock);
          
          if (outOfStockItems.length > 0) {
            this.isProcessingPayment = false;
            const names = outOfStockItems.map(r => 
              `"${r.item.prov_name}" (Solicitado: ${r.item.quantity}, Disponible: ${r.availableStock})`
            ).join(', ');
            
            this._messageService.error(
              "Stock Insuficiente",
              `Lo sentimos, no hay stock suficiente para completar tu pedido: ${names}. Por favor, reduce la cantidad antes de intentar pagar.`
            );
          } else {
            if (this.paymentMethod === 'card') {
              this.processCardPaymentSimulation(payload, orderNumber, notes, identity, orderDetails);
            } else {
              this.saveOrderAfterStockCheck(payload, orderNumber, notes, identity, orderDetails);
            }
          }
        },
        error: (err) => {
          console.warn('Fallo en checkStock preventivo, procediendo con guardado ordinario (fallback):', err);
          if (this.paymentMethod === 'card') {
            this.processCardPaymentSimulation(payload, orderNumber, notes, identity, orderDetails);
          } else {
            this.saveOrderAfterStockCheck(payload, orderNumber, notes, identity, orderDetails);
          }
        }
      });
    } else {
      if (this.paymentMethod === 'card') {
        this.processCardPaymentSimulation(payload, orderNumber, notes, identity, orderDetails);
      } else {
        this.saveOrderAfterStockCheck(payload, orderNumber, notes, identity, orderDetails);
      }
    }
  }

  private processCardPaymentSimulation(payload: any, orderNumber: number, notes: string, identity: any, orderDetails: any[]): void {
    const rawNumber = this.cardNumber.replace(/\s/g, '');
    const isDeclineCard = rawNumber.endsWith('4444');

    this.isProcessingPayment = true;
    this.processingMessage = '🔐 Estableciendo canal seguro SSL de 256 bits...';

    setTimeout(() => {
      this.processingMessage = '💳 Autorizando cargos con la entidad emisora (' + this.cardBrand.toUpperCase() + ')...';
      
      setTimeout(() => {
        this.processingMessage = '🛡️ Validando protocolos antifraude 3D Secure...';
        
        setTimeout(() => {
          if (isDeclineCard) {
            this.isProcessingPayment = false;
            this.processingMessage = '';
            this._messageService.error(
              "Transacción Rechazada",
              "Lo sentimos, la transacción fue rechazada por la entidad bancaria emisor (Fondos Insuficientes o Tarjeta Bloqueada). Por favor, intenta con otra tarjeta."
            );
          } else {
            this.processingMessage = '🚀 Pago aprobado con éxito. Guardando orden de compra...';
            setTimeout(() => {
              this.saveOrderAfterStockCheck(payload, orderNumber, notes, identity, orderDetails);
            }, 800);
          }
        }, 1500);
      }, 1500);
    }, 1500);
  }

  private saveOrderAfterStockCheck(payload: any, orderNumber: number, notes: string, identity: any, orderDetails: any[]): void {
    this.ordersService.saveOrder(payload).subscribe({
      next: (res: any) => {
        const orderUuid = res?.data?.ord_uuid || '';
        
        // Registrar movimientos de salida (OUT) por cada producto comprado en el checkout
        const movementRequests = orderDetails.map(item => {
          const movementPayload = {
            cmp_uuid: payload.cmp_uuid,
            pro_uuid: item.pro_uuid,
            prov_uuid: item.prov_uuid,
            ord_uuid: orderUuid || null,
            usr_uuid: identity ? identity.usr_uuid : null,
            tsmo_uuid: 'OUT',
            smo_quantity: item.ordd_quantity,
            smo_previousstock: 0,
            smo_currentstock: 0,
            smo_reason: `Venta - Pedido #PED-${orderNumber}`,
            smo_createdat: new Date()
          };
          return this._stockMovementsService.saveStockMovement(movementPayload);
        });

        // Ejecutar las peticiones en paralelo
        if (movementRequests.length > 0) {
          forkJoin(movementRequests).subscribe({
            next: () => console.log('Movimientos de stock registrados exitosamente desde Checkout.'),
            error: (err) => console.error('Error al registrar movimientos de stock desde Checkout:', err)
          });
        }

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
