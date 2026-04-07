import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NavBarComponent } from '@components/nav-bar/nav-bar.component';
import { StoreContextService } from '@services/store-context.service';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavBarComponent,
    NzLayoutModule
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent implements OnInit {

  public isStoreActive$: Observable<boolean>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storeContext: StoreContextService
  ) {
    this.isStoreActive$ = this.storeContext.activeStore$.pipe(
      map(store => !!store)
    );
  }

  ngOnInit(): void {
    // Escuchar cambios en la ruta para detectar el slug
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const slug = this.getSlugFromRoute(this.route.snapshot);
      if (slug) {
        this.storeContext.setStoreBySlug(slug).subscribe();
      } else {
        // Si no hay slug (ej: market-home), limpiamos el contexto o dejamos el por defecto
        this.storeContext.clearStore();
      }
    });
  }

  /**
   * Recorre recursivamente las rutas hijas para encontrar el parámetro 'slug'
   */
  private getSlugFromRoute(route: any): string | null {
    if (route.params && route.params['slug']) {
      return route.params['slug'];
    }
    if (route.firstChild) {
      return this.getSlugFromRoute(route.firstChild);
    }
    return null;
  }
}
