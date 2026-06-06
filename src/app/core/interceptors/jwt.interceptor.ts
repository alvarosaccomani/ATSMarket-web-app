import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '@services/session.service';

/**
 * Interceptor funcional que adjunta el token JWT de la sesión activa
 * en el encabezado Authorization para todas las peticiones salientes.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const session = sessionService.getCurrentSession();
  let token = session?.token;
  let source = 'sessionService';

  const rawLocalStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('session') : null;
  if (!token) {
    try {
      if (rawLocalStorage) {
        token = JSON.parse(rawLocalStorage)?.token;
        source = 'localStorage';
      }
    } catch (e) {
      console.error('Error reading localStorage in jwtInterceptor', e);
    }
  }

  console.log('[jwtInterceptor] URL:', req.url);
  console.log('[jwtInterceptor] rawLocalStorage:', rawLocalStorage);
  console.log('[jwtInterceptor] Token found:', !!token, 'from:', source);
  if (token) {
    console.log('[jwtInterceptor] Token value preview:', token.substring(0, 15) + '...');
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  console.log('[jwtInterceptor] Final headers in request:', req.headers.keys());
  console.log('[jwtInterceptor] Authorization header value:', req.headers.get('Authorization'));

  return next(req);
};
