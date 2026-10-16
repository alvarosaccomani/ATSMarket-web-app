import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SessionService } from '@services/session.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * @description Interceptor funcional que captura anomalías y códigos de error HTTP a nivel global en la aplicación.
 * Ante respuestas de tipo 401 (Unauthorized) o 403 (Forbidden), purga la sesión caduca mediante SessionService.logout(),
 * emite una advertencia de notificación contextual al usuario y lo redirige a /auth/login preservando la ruta previa.
 *
 * @param req Petición HTTP saliente interceptada (HttpRequest<unknown>).
 * @param next Siguiente manejador en la cadena de interceptores (HttpHandlerFn).
 * @returns {Observable<HttpEvent<unknown>>} Flujo observable de la respuesta HTTP o propagación de error capturado.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  return next(req).pipe(
    catchError((error) => {
      console.log('[errorInterceptor] Caught HTTP Error:', error.status, error.url);
      console.log('[errorInterceptor] Error details:', JSON.stringify(error.error, null, 2));

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