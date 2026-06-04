import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { UsersService } from '@services/users.service';

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

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usr_name: [null, [Validators.required, Validators.minLength(2)]],
      usr_surname: [null, [Validators.required, Validators.minLength(2)]],
      usr_nick: [null, [Validators.required, Validators.minLength(3)]],
      usr_email: [null, [Validators.required, Validators.email]],
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
    if (this.validateForm.valid) {
      this.isSubmitting = true;

      // Clonamos el objeto del formulario y eliminamos confirmPassword
      const { confirmPassword, ...userPayload } = this.validateForm.value;

      this._usersService.singup(userPayload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response && response.success === false) {
            this.message.error(response.message || 'Error al registrar el usuario');
          } else {
            this.message.success('🎉 ¡Registro completado con éxito! Por favor inicia sesión.');
            this._router.navigate(['/auth/login']);
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
