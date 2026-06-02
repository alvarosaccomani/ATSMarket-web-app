import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Guardia funcional que restringe el acceso a la consola de SuperAdministrador.
 * Valida que el usuario esté logueado y que cuente con la propiedad usr_sysadmin en true.
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
