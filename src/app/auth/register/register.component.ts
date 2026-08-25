import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-register',
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
    NzMessageModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  validateForm!: FormGroup;
  isSubmitting = false;

  // Estados para feedback visual de contraseña
  showPassword = false;
  hasUpperCase = false;
  hasLowerCase = false;
  hasNumber = false;
  hasSpecialChar = false;
  isValidLength = false;
  progressWidth = 0;
  barColor = '#dc3545';
  isFocused = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usr_name: [null, [Validators.required, Validators.minLength(2)]],
      usr_surname: [null, [Validators.required, Validators.minLength(2)]],
      usr_nick: [null, [Validators.required, Validators.minLength(3)]],
      usr_email: [null, [Validators.required, Validators.email]],
      usr_password: [null, [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });

    // Suscripción reactiva para validar la fuerza de la contraseña en tiempo real
    this.validateForm.get('usr_password')?.valueChanges.subscribe(value => {
      this.validatePassword(value);
    });
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public onFocus(): void {
    this.isFocused = true;
  }

  public onBlur(): void {
    this.isFocused = false;
  }

  public validatePassword(value: string): void {
    const password = value || '';
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasLowerCase = /[a-z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    this.isValidLength = password.length >= 8;

    const totalCriteria = 5;
    const fulfilledCriteria =
      (this.hasUpperCase ? 1 : 0) +
      (this.hasLowerCase ? 1 : 0) +
      (this.hasNumber ? 1 : 0) +
      (this.hasSpecialChar ? 1 : 0) +
      (this.isValidLength ? 1 : 0);

    this.progressWidth = (fulfilledCriteria / totalCriteria) * 100;

    if (this.progressWidth >= 100) {
      this.barColor = '#28a745'; // Verde
    } else if (this.progressWidth >= 60) {
      this.barColor = '#ffc107'; // Amarillo
    } else {
      this.barColor = '#dc3545'; // Rojo
    }
  }

  public passwordStrengthValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;
    return !passwordValid ? { passwordStrength: true } : null;
  };

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
    if (this.validateForm.valid) {
      this.isSubmitting = true;

      // Clonamos el objeto del formulario y eliminamos confirmPassword
      const { confirmPassword, ...userPayload } = this.validateForm.value;

      this._authService.singup(userPayload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response && response.success === false) {
            this.message.error(response.message || 'Error al registrar el usuario');
          } else {
            const email = this.validateForm.get('usr_email')?.value || '';
            this.message.success('🎉 ¡Registro completado con éxito!');
            this._router.navigate(['/auth/account-created', email]);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error de registro:', error);
          const errDetail = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado durante el registro.';
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
