import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';

/**
 * @description Guardia funcional que asegura que el comerciante esté autenticado y cuente
 * con un contexto de empresa/sucursal seleccionado y activo antes de acceder a paneles operativos de backoffice.
 * Si no está autenticado, redirige al login con returnUrl; si está autenticado pero no seleccionó empresa,
 * redirige automáticamente a la selección de empresas (/application/my-companies).
 *
 * @param route Instantánea de la ruta activa (ActivatedRouteSnapshot).
 * @param state Estado actual del router (RouterStateSnapshot).
 * @returns {boolean} Retorna true si cumple ambas validaciones de seguridad; false en caso de redirección forzada.
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
