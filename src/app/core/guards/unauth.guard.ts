import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';

/**
 * @description Guardia funcional que impide el acceso a vistas públicas de login, registro o recuperación
 * a usuarios que ya poseen una sesión activa, redirigiéndolos de manera automática al panel privado (/application/my-companies).
 *
 * @param route Instantánea de la ruta pública solicitada.
 * @param state Estado actual de la navegación en el router.
 * @returns {boolean} Retorna true si el usuario es anónimo; false con redirección si ya tiene sesión.
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
