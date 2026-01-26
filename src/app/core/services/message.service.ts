import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

export interface MessageConfig {
  title: string;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  confirmButtonColor?: string;
  showCancelButton?: boolean;
  cancelButtonColor?: string;
  cancelButtonText?: string;
}

export type MessageCallback = (result: SweetAlertResult<any>) => void;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  private defaultConfig: Partial<MessageConfig> = {
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6',
    showCancelButton: false,
    cancelButtonColor: '#d33'
  };

  /**
   * Muestra un mensaje con SweetAlert2
   * @param title Título del mensaje
   * @param type Tipo de mensaje
   * @param text Texto del mensaje
   * @param callback Función a ejecutar después de aceptar (recibe el resultado)
   */
  public showMessage(title: string, type: MessageConfig['type'], text: string, callback?: MessageCallback): void {
    const config: MessageConfig = {
      title,
      type,
      text,
      ...this.defaultConfig
    };

    this.showCustomMessage(config, callback);
  }

  /**
   * Muestra un mensaje con configuración personalizada
   * @param config Configuración del mensaje
   * @param callback Función a ejecutar que recibe el resultado
   */
  public showCustomMessage(config: MessageConfig, callback?: MessageCallback): void {
    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.type,
      showCancelButton: config.showCancelButton || false,
      confirmButtonColor: config.confirmButtonColor || '#3085d6',
      confirmButtonText: config.confirmButtonText || 'Aceptar',
      cancelButtonText: config.cancelButtonText || 'Cancelar',
      cancelButtonColor: config.cancelButtonColor || '#d33'
    }).then((result: SweetAlertResult<any>) => {
      console.info('Message result:', result);

      // Ejecutar el callback si se proporciona
      if (callback && typeof callback === 'function') {
        callback(result);
      }
    });
  }

  /**
   * Métodos rápidos para tipos de mensaje comunes
   */

  public success(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'success', text, callback);
  }

  public error(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'error', text, callback);
  }

  public warning(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'warning', text, callback);
  }

  public info(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'info', text, callback);
  }

  public confirm(
    title: string,
    text: string,
    confirmCallback?: () => void,
    cancelCallback?: () => void,
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'No',
    confirmButtonColor: string = '#3085d6',
    cancelButtonColor: string = '#d33'
  ): void {
    Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      cancelButtonText
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed && confirmCallback) {
        confirmCallback();
      } else if (result.isDismissed && cancelCallback) {
        cancelCallback();
      }
    });
  }
}
