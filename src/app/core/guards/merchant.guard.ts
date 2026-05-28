import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';

/**
 * Guardia funcional que asegura que el comerciante esté autenticado y tenga un contexto
 * de empresa seleccionado activo antes de interactuar con paneles operativos.
 */
export const merchantGuard: CanActivateFn = (route, state) => {
const sessionService = inject(SessionService);
  const router = inject(Router);

  // 1. Validar autenticación base
  if (!sessionService.getIdentity()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 2. Validar contexto de comercio/compañía activo
  if (!sessionService.getCompany()) {
    // Si no tiene empresa seleccionada, expulsar a la pantalla de selección
    router.navigate(['/application/my-companies']);
    return false;
  }

  return true;
};
