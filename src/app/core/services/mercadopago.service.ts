import { Injectable } from '@angular/core';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MercadopagoService {

  private scriptLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() { }

  /**
   * Carga el SDK JS v2 de Mercado Pago de forma dinámica y segura
   */
  public loadSdk(): Promise<void> {
    if (this.scriptLoaded && window.MercadoPago) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      if (existingScript) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        this.scriptLoaded = true;
        console.log('🔌 [MercadoPagoService] SDK v2 cargado exitosamente.');
        resolve();
      };

      script.onerror = (error) => {
        this.loadPromise = null;
        console.error('❌ [MercadoPagoService] Error al cargar el SDK de Mercado Pago:', error);
        reject(error);
      };

      document.body.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Inicializa la instancia de MercadoPago con la clave pública
   */
  public async getInstance(publicKey: string): Promise<any> {
    await this.loadSdk();
    if (!window.MercadoPago) {
      throw new Error('El SDK de Mercado Pago no está disponible en window.');
    }
    return new window.MercadoPago(publicKey, { locale: 'es-AR' });
  }
}
