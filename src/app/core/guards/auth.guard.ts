import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';

/**
 * Guardia de autenticación funcional para verificar que el usuario tenga una sesión activa.
 * Redirige a /auth/login conservando la URL original de destino en el parámetro 'returnUrl'.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.getIdentity()) {
    return true;
  }

  // Redirigir a login pasando el query parameter returnUrl
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
