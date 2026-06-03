import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@services/session.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Guardia funcional reutilizable que controla el acceso a rutas según el rol
 * del usuario dentro del contexto de la compañía seleccionada.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  // 1. Validar autenticación básica
  const identity = sessionService.getIdentity();
  if (!identity) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 1.5. Bypass para SuperAdministrador global de la plataforma
  if (identity.usr_sysadmin === true || identity.usr_sysadmin === 1 || identity.usr_sysadmin === '1') {
    return true;
  }

  // 2. Validar contexto de compañía activo
  const company = sessionService.getCompany();
  if (!company) {
    router.navigate(['/application/my-companies']);
    return false;
  }

  // 3. Validar roles requeridos desde la configuración de la ruta
  const expectedRoles = route.data['expectedRoles'] as string[];
  if (!expectedRoles || expectedRoles.length === 0) {
    return true; // Si no hay roles específicos requeridos, dar acceso
  }

  // Los roles del usuario en la compañía activa están guardados en company.roles
  const userRoles = company.roles || [];
  
  // Verificar si alguno de los roles del usuario coincide con los roles permitidos
  const hasRequiredRole = userRoles.some((userRole: any) => 
    expectedRoles.some(expected => expected.toLowerCase() === userRole.rol_name?.toLowerCase())
  );

  if (hasRequiredRole) {
    return true;
  }

  // Si no cuenta con los roles correspondientes, expulsar y notificar
  message.error('Permisos insuficientes: No tienes autorización para acceder a esta sección de la tienda.');
  router.navigate(['/application/products']);
  return false;
};
