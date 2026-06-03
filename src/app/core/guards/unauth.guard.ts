import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';

/**
 * Guardia funcional que impide el acceso a vistas públicas de login/registro
 * a usuarios que ya poseen una sesión activa, redirigiéndolos al panel privado.
 */
export const unauthGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.getIdentity()) {
    // Si ya está autenticado, enviarlo al listado de empresas
    router.navigate(['/application/my-companies']);
    return false;
  }

  return true;
};
