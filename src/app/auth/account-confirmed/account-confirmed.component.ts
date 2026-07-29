import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-account-confirmed',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzAlertModule,
    NzSpinModule
  ],
  templateUrl: './account-confirmed.component.html',
  styleUrl: './account-confirmed.component.scss'
})
export class AccountConfirmedComponent implements OnInit {
  isLoading = true;
  isConfirmed = false;
  errorMessage = '';
  token = '';

  constructor(
    private _route: ActivatedRoute,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.token = this._route.snapshot.params['usr_ConfirmationToken'] || '';

    if (this.token) {
      this.confirmEmail(this.token);
    } else {
      this.isLoading = false;
      this.isConfirmed = false;
      this.errorMessage = 'No se ha detectado un token de confirmación en el enlace.';
    }
  }

  private confirmEmail(token: string): void {
    this.isLoading = true;
    this._authService.confirmAccount(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success === false) {
          this.isConfirmed = false;
          this.errorMessage = response.message || 'El token proporcionado no es válido o ya ha sido utilizado.';
        } else {
          this.isConfirmed = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.isConfirmed = false;
        console.error('Error al confirmar cuenta:', error);
        this.errorMessage = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado al procesar la confirmación de tu cuenta. Por favor, reintenta.';
      }
    });
  }
}
