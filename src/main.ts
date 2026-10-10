import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Registro del Service Worker
if ('serviceWorker' in navigator && environment.production) {
  let isPromptOpen = false;

  const promptUserToUpdate = (worker: ServiceWorker) => {
    if (isPromptOpen) return;
    isPromptOpen = true;

    import('sweetalert2').then((SwalModule) => {
      const Swal = SwalModule.default;
      Swal.fire({
        title: '🔄 Actualización Disponible',
        text: 'Hay una nueva versión de ATS Market con mejoras y correcciones. ¿Deseas recargar la aplicación para ver los cambios?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#1890ff',
        cancelButtonColor: '#8c8c8c',
        confirmButtonText: 'Sí, actualizar ahora',
        cancelButtonText: 'Más tarde'
      }).then((result) => {
        isPromptOpen = false;
        if (result.isConfirmed) {
          worker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });
  };

  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    console.log('Service Worker registrado con éxito:', registration);

    // Si hay un Service Worker listo en espera
    if (registration.waiting) {
      promptUserToUpdate(registration.waiting);
    }

    // Chequear si se descubre una nueva versión durante el uso
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            promptUserToUpdate(installingWorker);
          }
        };
      }
    };
  }).catch((error) => {
    console.error('Error al registrar el Service Worker:', error);
  });

  // Cuando el nuevo Service Worker asume el control tras el skipWaiting, recargar la página una sola vez
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
