import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { SessionService } from '@services/session.service';

@Component({
  selector: 'app-sso-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sso-callback.component.html',
  styleUrl: './sso-callback.component.scss'
})
export class SsoCallbackComponent implements OnInit {
  public status: 'loading' | 'success' | 'error' = 'loading';
  public errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.errorMessage = 'No se proporcionó un token de intercambio válido para la autenticación SSO.';
      return;
    }

    this.verifyToken(token);
  }

  private verifyToken(token: string): void {
    this.status = 'loading';
    this.authService.verifySSOToken(token).subscribe({
      next: (res: any) => {
        if (res.success && res.data?.token && res.data?.user) {
          this.status = 'success';
          
          // Guardar identidad y token en el localstorage
          this.sessionService.setIdentity(JSON.stringify(res.data.user));
          this.sessionService.setToken(res.data.token);
          
          // Redirigir a mis compañías
          setTimeout(() => {
            this.router.navigate(['/application/my-companies']);
          }, 1200);
        } else {
          this.status = 'error';
          this.errorMessage = 'El servidor no devolvió una sesión válida de SSO.';
        }
      },
      error: (err: any) => {
        this.status = 'error';
        this.errorMessage = err.error?.error || err.error?.message || 'El token de intercambio SSO es inválido o ya ha expirado.';
      }
    });
  }

  public retryLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
