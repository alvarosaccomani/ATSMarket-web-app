import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { UsersService } from '@services/users.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzMessageModule,
    NzAlertModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  validateForm!: FormGroup;
  isSubmitting = false;
  emailSent = false;
  sentEmailAddress = '';

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usr_email: [null, [Validators.required, Validators.email]]
    });
  }

  public submitForm(): void {
    if (this.validateForm.valid) {
      this.isSubmitting = true;
      const emailValue = this.validateForm.value;

      this._usersService.forgotPassword(emailValue.usr_email).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response && response.success === false) {
            this.message.error(response.message || 'Error al procesar la solicitud');
          } else {
            this.sentEmailAddress = this.validateForm.get('usr_email')?.value;
            this.emailSent = true;
            this.message.success('✉️ Instrucciones de recuperación enviadas con éxito.');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error de recuperación de contraseña:', error);
          const errDetail = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado al enviar las instrucciones.';
          this.message.error(errDetail);
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
