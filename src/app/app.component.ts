import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * @description Componente raíz de la aplicación ATSMarket.
 * Aloja el elemento <router-outlet> principal para la carga modular y enrutamiento dinámico.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /**
   * @description Título institucional de la aplicación web.
   */
  title = 'ATSMarket-web-app';
}