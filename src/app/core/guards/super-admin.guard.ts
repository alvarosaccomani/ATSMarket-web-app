import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * @description Guardia funcional que restringe el acceso a la consola de administración global de la plataforma (SuperAdmin).
 * Verifica que el usuario cuente con sesión activa y que la bandera usr_sysadmin sea afirmativa (true / 1).
 * Si no cumple con el nivel de autorización maestro, bloquea la navegación, emite una alerta de error y redirige a mis empresas.
 *
 * @param route Instantánea de la ruta activa que se intenta activar.
 * @param state Estado y URL solicitada en el router.
 * @returns {boolean} Retorna true si el usuario es administrador global de la plataforma; false si es rechazado.
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  const identity = sessionService.getIdentity();

  if (identity && (identity.usr_sysadmin === true || identity.usr_sysadmin === 1 || identity.usr_sysadmin === '1')) {
    return true;
  }

  // Si no cuenta con permisos, denegar acceso y redirigir
  message.error('Acceso denegado: Esta sección es exclusiva para administradores globales de la plataforma.');
  router.navigate(['/application/my-companies']);
  return false;
};
