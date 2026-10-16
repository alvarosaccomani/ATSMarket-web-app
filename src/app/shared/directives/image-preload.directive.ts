import { Directive, Input, HostBinding } from '@angular/core';

/**
 * @description Directiva de atributos para elementos <img> que proporciona gestión de precarga
 * y sustitución automática por una imagen de respaldo (fallback o placeholder) ante errores 404 o caídas de red.
 */
@Directive({
  standalone: true,
  selector: 'img[default]',
  host: {
    '(error)': 'updateUrl()',
    '(load)': 'load()',
    '[src]': 'src'
  }
})
export class ImagePreloadDirective {

  /**
   * @description URL original de la imagen que se desea renderizar.
   */
  @Input() src!: string;
  /**
   * @description Ruta o URL de la imagen por defecto que se aplicará si falla la carga de src.
   */
  @Input() default!: string;
  /**
   * @description Clase CSS vinculada al elemento host para transiciones de opacidad al cargar.
   */
  @HostBinding('class') className!: string;

  constructor() { }

  /**
   * @description Manejador ejecutado al dispararse el evento (error) en el elemento <img>; conmuta la fuente al placeholder.
   * @returns {void}
   */
  updateUrl(): void {
    this.src = this.default;
  }

  /**
   * @description Manejador del evento (load); añade la clase 'image-loaded' para efectos visuales.
   * @returns {void}
   */
  load(): void {
    this.className = 'image-loaded';
  }

}
