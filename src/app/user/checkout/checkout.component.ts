import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// NG-ZORRO IMPORTS
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';

// SERVICIOS Y MODELOS
import { CartService } from '@services/cart.service';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzGridModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDividerModule,
    NzStatisticModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {

  shippingForm!: FormGroup;
  totalPrice: number = 0;
  cartItemCount: number = 0;

  // Opciones para países (simplificadas)
  countries = [
    { label: 'Argentina', value: 'AR' },
    // ... otros países si aplica
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario reactivo
    this.shippingForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      direccion: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required]],
      pais: ['AR', [Validators.required]],
    });

    // Cargar datos del carrito
    this.cartService.cartItems$.subscribe(items => {
      if (items.length === 0) {
        this.message.warning('Su carrito está vacío. Redirigiendo al catálogo.');
        this.router.navigate(['/catalogo']);
      }
      this.totalPrice = this.cartService.getTotalPrice();
      this.cartItemCount = items.length;
    });
  }

  public submitForm(): void {
    if (this.shippingForm.valid) {
      console.log('Datos de Envío Válidos:', this.shippingForm.value);

      // Aquí se enviaría la orden al backend (que debe manejar el Marketplace)
      this.message.success('Orden enviada. Procesando pago...');

      // Limpiar carrito y redirigir
      this.cartService.clearCart();
      this.router.navigate(['/confirmacion']);
    } else {
      Object.values(this.shippingForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Por favor, complete todos los campos requeridos.');
    }
  }
}
