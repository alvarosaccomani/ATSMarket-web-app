import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '@services/session.service';

/**
 * @description Interceptor funcional que inyecta automáticamente el token de autenticación JWT
 * en la cabecera 'Authorization: Bearer <token>' para todas las peticiones HTTP salientes hacia la API.
 * Resuelve el token consultando SessionService y recurre a localStorage como mecanismo de respaldo.
 *
 * @param req Petición HTTP saliente que será clonada y modificada.
 * @param next Siguiente eslabón en la cadena de ejecución de interceptores.
 * @returns {Observable<HttpEvent<unknown>>} Petición con encabezado de autorización adjunto si el token está presente.
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
