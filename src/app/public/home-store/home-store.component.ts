import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { CategoryInterface } from '@interfaces/category.interface';
import { StoreContextService } from '@services/store-context.service';
import { CartService } from '@services/cart.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { CategoriesService } from '@services/categories.service';
import { AnalyticsService } from '@services/analytics.service';
import { CompanyInterface } from '@interfaces/company';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzGridModule,
    NzCardModule,
    NzCarouselModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzSpinModule,
    NzEmptyModule
  ],
  templateUrl: './home-store.component.html',
  styleUrl: './home-store.component.scss'
})
export class HomeStoreComponent {

  public companieSlug: string = '';
  // Propiedad para los productos destacados en el Home
  public destacados: ProductVariationInterface[] = [];

  // Propiedad para las categorías que se mostrarán en la grilla del Home
  public categorias: CategoryInterface[] = [];
  public store: CompanyInterface | null = null;

  // Almacena las configuraciones de la tienda (clave: valor)
  public storeSettings: { [key: string]: any } = {};
  public isSettingsLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _storeContext: StoreContextService,
    private _cartService: CartService,
    private _productVariationsService: ProductVariationsService,
    private _categoriesService: CategoriesService,
    private titleService: Title,
    private metaService: Meta,
    private _analyticsService: AnalyticsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    // Escucha el slug de la URL para guardar referencia si es necesario
    this.route.paramMap.subscribe(params => {
      this.companieSlug = params.get('slug') || '';
    });

    // Suscribirse a las configuraciones globales detectadas por el Layout
    this._storeContext.storeSettings$.subscribe(settings => {
      this.storeSettings = settings;
    });

    this._storeContext.isLoading$.subscribe(loading => {
      this.isSettingsLoading = loading;
    });

    // 1. Suscribirse reactivamente a la tienda activa para cargar sus productos destacados y categorías principales
    this._storeContext.activeStore$.subscribe(store => {
      if (store && store.cmp_uuid) {
        this.store = store; // Guardar referencia de la tienda activa
        
        // Tracking: Registrar visita a la tienda
        this._analyticsService.trackEvent(store.cmp_uuid, 'PAGE_VIEW').subscribe({
          error: (err) => console.error('Error tracking page view:', err)
        });

        // SEO: Configurar el título del documento y meta description dinámicamente
        this.titleService.setTitle(`${store.cmp_name} | ATSMarket`);
        if (store.cmp_description) {
          this.metaService.updateTag({ name: 'description', content: store.cmp_description });
        }

        this.loadProductosDestacados(store.cmp_uuid);
        this.loadCategoriasPrincipales(store.cmp_uuid);
      }
    });

    
  }

  // Simulación de carga de datos (reemplazar con llamadas al backend)
  public loadCategoriasPrincipales(cmpUuid: string): void {
    this._categoriesService.getCategories(cmpUuid, '').subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.categorias = res.data.map((cat: any) => ({
            nombre: cat.cat_name,
            descripcion: cat.cat_description || '',
            imagenUrl: cat.gcat_image || 'https://placehold.co/400x400/eeeeee/8c8c8c?text=Categor%C3%ADa',
            link: `/public/store-catalog/${this.companieSlug}?category=${cat.cat_uuid}`
          }));
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías principales:', err);
      }
    });
  }

  private loadProductosDestacados(cmpUuid: string): void {
    this._productVariationsService.getProductsVariations(cmpUuid, '').subscribe({
      next: (res) => {
        if (res && res.data) {
          this.destacados = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos destacados:', err);
      }
    });
  }

  public consultarPrecio(producto: ProductVariationInterface): void {
    const whatsapp = this.getSetting('STORE_WHATSAPP', '');
    const message = `Hola, me interesa el producto: ${producto.prov_name} (Ref: ${producto.prov_sku})`;

    if (whatsapp) {
      const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      // Fallback si no hay WhatsApp configurado
      alert(`Consulta por "${producto.prov_name}" (Ref: ${producto.prov_sku}). Contacte con la tienda para más información.`);
    }
  }

  public agregarAlCarrito(producto: ProductVariationInterface): void {
    // Validar stock si no se permiten pedidos sin stock
    const allowBackorders = this.getSetting('ALLOW_BACKORDERS', true);
    if (!allowBackorders && producto.prov_stock <= 0) {
      this.message.error('Lo sentimos, este producto no tiene stock disponible.');
      return;
    }

    this._cartService.addToCart(producto, 1);

    // Tracking: Registrar adición al carrito
    if (this.store && this.store.cmp_uuid) {
      this._analyticsService.trackEvent(this.store.cmp_uuid, 'ADD_TO_CART', producto.prov_uuid).subscribe({
        error: (err) => console.error('Error tracking add to cart:', err)
      });
    }
  }

  public goToStoreCatalog(): void {
    this.router.navigate(['/public/store-catalog', this.companieSlug]);
  }

  public getGoogleMapsLink(store: CompanyInterface): string {
    if (store.cmp_lat && store.cmp_lng) {
      return `https://www.google.com/maps/search/?api=1&query=${store.cmp_lat},${store.cmp_lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.cmp_address)}`;
  }

  public openProductDetail(producto: ProductVariationInterface): void {
    this.router.navigate(['/public/store-catalog', this.companieSlug, 'product', producto.prov_uuid]);
  }

  /**
   * Obtiene un valor de configuración con un valor por defecto
   */
  public getSetting(key: string, defaultValue: any): any {
    return this._storeContext.getSetting(key, defaultValue);
  }
}
