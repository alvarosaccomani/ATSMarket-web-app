import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';

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
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  validateForm!: FormGroup;
  isSubmitting = false;
  resetSuccessful = false;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    // Capturar token desde query params o route params
    this.token = this._route.snapshot.queryParams['usr_ResetPasswordToken'] || 
                 this._route.snapshot.params['usr_ResetPasswordToken'] || 
                 '';

    if (!this.token) {
      this.message.warning('⚠️ No se ha proporcionado un token de restablecimiento válido.');
    }

    this.validateForm = this.fb.group({
      usr_password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls['confirmPassword'].updateValueAndValidity());
  }

  confirmationValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (this.validateForm && control.value !== this.validateForm.controls['usr_password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  public submitForm(): void {
    if (!this.token) {
      this.message.error('Token no válido o expirado. Vuelve a solicitar la recuperación.');
      return;
    }

    if (this.validateForm.valid) {
      this.isSubmitting = true;

      // El payload enviado al backend incluye el token y la nueva contraseña
      const payload = {
        token: this.token,
        usr_resetpasswordtoken: this.token, // para soportar ambos formatos
        newPassword: this.validateForm.value.usr_password,
        usr_password: this.validateForm.value.usr_password // para soportar ambos formatos
      };

      this._usersService.resetPassword(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response && response.success === false) {
            this.message.error(response.message || 'Error al restablecer la contraseña.');
          } else {
            this.resetSuccessful = true;
            this.message.success('🎉 Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error de restablecimiento de contraseña:', error);
          const errDetail = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado al restablecer la contraseña.';
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
