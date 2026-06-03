import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SessionService } from '@services/session.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Interceptor funcional que captura errores HTTP globales (401 y 403)
 * para limpiar la sesión expirada, notificar al usuario y redirigirlo a login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  return next(req).pipe(
    catchError((error) => {
      if ([401, 403].includes(error.status)) {
        // Guardar la URL actual de destino para retorno
        const currentUrl = router.url;
        
        sessionService.logout();
        message.warning('Sesión expirada o permisos denegados. Por favor, inicie sesión nuevamente.');
        
        // Evitar bucle si ya estamos en la pantalla de login
        if (!currentUrl.includes('/auth/login')) {
          router.navigate(['/auth/login'], { queryParams: { returnUrl: currentUrl } });
        }
      }
      return throwError(() => error);
    })
  );
};