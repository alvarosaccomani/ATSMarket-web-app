import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SessionService } from '@services/session.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  validateForm!: FormGroup;
  isSubmitting = false;
  public identity: any = null;
  public token: any = null;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sessionService: SessionService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkAppConfig();
    this.validateForm = this.fb.group({
      usr_user: [null, [Validators.required]],
      usr_password: [null, [Validators.required]]
    });
  }

  private checkAppConfig(): void {
    this._authService.getAppConfig().subscribe({
      next: (data: any) => {
        if (data.success && data.app_login_mode === 'central' && data.central_login_url) {
          window.location.href = data.central_login_url;
        }
      },
      error: (err) => console.error('Error al obtener la configuración SSO:', err)
    });
  }

  public submitForm(): void {
    if (this.validateForm.valid) {
      this.isSubmitting = true;

      this._authService.login(this.validateForm.value).subscribe({
        next: (response: any) => {
          this.identity = response.data;
          if (!this.identity || !this.identity.usr_uuid) {
            this.message.error('error');
          } else {
            //persist user data
            this._sessionService.setIdentity(JSON.stringify(this.identity));

            // Enviar evento de login exitoso al Kernel Central
            this._authService.logAuth(this.identity.usr_uuid, 'Market').subscribe({
              error: (err: any) => console.error('Error al enviar log a Central:', err)
            });

            //get token
            this.getToken();
          }
          this.isSubmitting = false;
        },
        error: (err: any) => {
          this.isSubmitting = false;
          console.error(err);
          const errMsg = err.error?.error || err.error?.message || 'Error de conexión con el servidor';
          this.message.error(errMsg);
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

  private getToken(): void {
    this._authService.login(this.validateForm.value, 'true').subscribe({
      next: (response: any) => {
        this.token = response.data.token;
        if (this.token.length <= 0) {
          this.message.error('error');
        } else {
          //persist user token
          this._sessionService.setToken(this.token);
          // Redirigir dinámicamente si existe un returnUrl query parameter
          const returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/application/my-companies';
          this._router.navigateByUrl(returnUrl);
        }
      },
      error: (err: any) => {
        console.error(err);
        const errMsg = err.error?.error || err.error?.message || 'Error de conexión con el servidor';
        this.message.error(errMsg);
      }
    });
  }
}
