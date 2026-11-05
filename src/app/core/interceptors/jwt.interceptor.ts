import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '@services/session.service';
import { environment } from '../../../environments/environment';

/**
 * @description Interceptor funcional que inyecta automáticamente el token de autenticación JWT
 * en la cabecera 'Authorization: Bearer <token>' exclusivamente para las peticiones salientes
 * dirigidas hacia nuestra propia API (environment.apiUrl).
 *
 * BYPASS CRÍTICO DE STORAGE / S3 / R2:
 * Si la petición apunta a un servicio externo (por ejemplo Cloudflare R2 / AWS S3 via Presigned URL),
 * NUNCA se debe adjuntar 'Authorization: Bearer', ya que S3 valida la firma en los query params
 * y rechaza la petición con error 400 por colisión de esquemas de autenticación.
 *
 * @param req Petición HTTP saliente que será clonada y modificada si aplica.
 * @param next Siguiente eslabón en la cadena de ejecución de interceptores.
 * @returns {Observable<HttpEvent<unknown>>} Petición con encabezado de autorización adjunto si el destino es la API propia.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptar peticiones destinadas a la API propia
  const isApiUrl = req.url.startsWith(environment.apiUrl);
  if (!isApiUrl) {
    return next(req);
  }

  const sessionService = inject(SessionService);
  const session = sessionService.getCurrentSession();
  let token = session?.token;

  if (!token && typeof localStorage !== 'undefined') {
    try {
      const rawLocalStorage = localStorage.getItem('session');
      if (rawLocalStorage) {
        token = JSON.parse(rawLocalStorage)?.token;
      }
    } catch (e) {
      console.error('Error reading localStorage in jwtInterceptor', e);
    }
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
