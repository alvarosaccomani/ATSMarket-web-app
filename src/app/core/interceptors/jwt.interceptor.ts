import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '@services/session.service';

/**
 * Interceptor funcional que adjunta el token JWT de la sesión activa
 * en el encabezado Authorization para todas las peticiones salientes.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const token = sessionService.getCurrentSession()?.token;

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
