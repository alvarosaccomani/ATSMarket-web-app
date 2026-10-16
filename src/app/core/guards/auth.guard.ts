import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';

/**
 * @description Guardia funcional de autenticación para rutas protegidas en Angular.
 * Verifica la existencia de una identidad y sesión activa de usuario a través de SessionService.
 * En caso de no estar autenticado, intercepta la navegación y redirige hacia el formulario
 * de inicio de sesión (/auth/login), preservando la URL original solicitada en el parámetro query 'returnUrl'.
 *
 * @param route Instantánea del estado de la ruta solicitada (ActivatedRouteSnapshot).
 * @param state Instantánea del estado del router en el momento de la navegación (RouterStateSnapshot).
 * @returns {boolean} Retorna true si el usuario posee sesión activa válida; de lo contrario false con redirección.
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
