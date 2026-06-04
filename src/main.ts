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
  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    console.log('Service Worker registrado con éxito:', registration);

    // Chequear si hay actualizaciones en el servidor
    registration.update();

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Cargar dinámicamente SweetAlert para no incrementar el tamaño de carga inicial
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
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            });
          }
        };
      }
    };
  }).catch((error) => {
    console.error('Error al registrar el Service Worker:', error);
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
