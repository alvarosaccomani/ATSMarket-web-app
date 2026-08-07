import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ProductVariationInterface } from '@interfaces/product-variation';
import { CartService } from '@services/cart.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { SessionService } from '@services/session.service';
import { OrdersService } from '@services/orders.service';
import { StoreContextService } from '@services/store-context.service';
import { ProductVariationReviewsService } from '@services/product-variation-reviews.service';
import { ProductVariationReviewInterface } from '@interfaces/product-variation-review';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzLayoutModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzRateModule,
    NzProgressModule,
    NzAvatarModule,
    NzMessageModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule,
    NzInputModule,
    NzToolTipModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {

  public storeSlug: string = '';
  public productId: string = ''; // prov_uuid
  public producto: ProductVariationInterface | null = null;
  public isLoading: boolean = true;

  // Variables de Reseñas
  public reviews: any[] = [];
  public averageRating = 0;
  public ratingDistribution: { [stars: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  // Formulario Nueva Reseña
  public userRating = 5;
  public userComment = '';
  public isSubmittingReview = false;
  public isVerifiedBuyer = false;
  public activeCustomer: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private productVariationsService: ProductVariationsService,
    private _sessionService: SessionService,
    private _ordersService: OrdersService,
    private _storeContext: StoreContextService,
    private _reviewsService: ProductVariationReviewsService,
    private message: NzMessageService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    // Escuchar parámetros de la URL
    this.route.paramMap.subscribe(params => {
      this.storeSlug = params.get('slug') || '';
      this.productId = params.get('pro_uuid') || '';
      
      this.isLoading = true;
      this.producto = null;

      // Esperar a tener el contexto de la tienda cargado
      this._storeContext.activeStore$.subscribe(store => {
        if (store) {
          this.loadProductDetails(store.cmp_uuid);
        } else if (this.storeSlug) {
          // Si por alguna razón no hay store context, la cargamos usando el slug
          this._storeContext.setStoreBySlug(this.storeSlug).subscribe(success => {
            if (success) {
              // El activeStore$.subscribe de arriba capturará automáticamente 
              // la tienda recién establecida y cargará sus productos de forma segura.
            }
          });
        }
      });
    });
  }

  private loadProductDetails(cmp_uuid: string): void {
    if (!cmp_uuid || !this.productId) return;

    this.productVariationsService.getProductsVariations(cmp_uuid, '', this.storeSlug)
      .subscribe({
        next: (res: any) => {
          const list = res.data || [];
          // Filtrar por prov_uuid para obtener la variación exacta
          const found = list.find((p: any) => p.prov_uuid === this.productId);
          
          if (found) {
            this.producto = found;
            this.updateMetaTags(found);
            this.loadProductReviews(this.productId);
            
            // Validar si es comprador verificado
            const session = this._sessionService.getCurrentSession() as any;
            this.activeCustomer = session?.customer || session?.identity || null;
            
            if (this.activeCustomer && this.activeCustomer.cus_uuid) {
              this.checkIfVerifiedBuyer(this.activeCustomer.cus_uuid, this.productId);
            } else {
              this.isVerifiedBuyer = false;
            }
          } else {
            this.message.error('Producto no encontrado en esta tienda.');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar el producto:', err);
          this.message.error('Ocurrió un error al cargar la información del producto.');
          this.isLoading = false;
        }
      });
  }

  public getSetting(key: string, defaultValue: any): any {
    return this._storeContext.getSetting(key, defaultValue);
  }

  public agregarAlCarrito(): void {
    if (this.producto) {
      this.cartService.addToCart(this.producto, 1);
    }
  }

  public volverAlCatalogo(): void {
    this.router.navigate(['/public/store-catalog', this.storeSlug]);
  }

  // --- MÉTODOS DE RESEÑAS ---

  private checkIfVerifiedBuyer(cus_uuid: string, prov_uuid: string): void {
    this._ordersService.getOrdersByCustomer(cus_uuid).subscribe({
      next: (res: any) => {
        const orders = res?.data || [];
        this.isVerifiedBuyer = orders.some((o: any) => 
          o.ords_uuid !== 'CANCELLED' && 
          o.orderDetails && 
          o.orderDetails.some((d: any) => d.prov_uuid === prov_uuid)
        );
      },
      error: () => {
        this.isVerifiedBuyer = true; // Fallback interactivo local
      }
    });
  }

  public loadProductReviews(prov_uuid: string): void {
    const cmpUuid = this.producto?.cmp_uuid || '';
    const proUuid = this.producto?.pro_uuid || '';

    this._reviewsService.getProductVariationReviews(cmpUuid, proUuid, prov_uuid).subscribe({
      next: (res) => {
        const serverReviews = res.data || [];
        
        // Map the backend structure to the template properties
        this.reviews = serverReviews.map(r => ({
          author: (r as any).provrev_author || 'Comprador Anónimo',
          avatar: (r as any).provrev_avatar || 'CA',
          rating: r.provrev_rating,
          comment: r.provrev_comment,
          date: r.provrev_createdat,
          verified: r.provrev_isverified
        }));
        
        // Sort chronologically (newest first)
        this.reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const totalReviews = this.reviews.length;
        if (totalReviews > 0) {
          const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
          this.averageRating = Number((sum / totalReviews).toFixed(1));

          this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          this.reviews.forEach(r => {
            const rating = r.rating as number;
            if (this.ratingDistribution[rating] !== undefined) {
              this.ratingDistribution[rating]++;
            }
          });
        } else {
          this.averageRating = 0;
          this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        }
      },
      error: (err) => {
        console.error('Error loading reviews from database:', err);
        this.reviews = [];
        this.averageRating = 0;
        this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        this.message.error('No se pudieron cargar las reseñas del servidor.');
      }
    });
  }

  public submitReview(): void {
    if (!this.producto) return;
    if (!this.userComment.trim()) {
      this.message.warning('Por favor, ingresá una opinión escrita.');
      return;
    }

    this.isSubmittingReview = true;
    
    // Construct real payload according to database schema / interface
    const reviewData: Partial<ProductVariationReviewInterface> = {
      cmp_uuid: this.producto.cmp_uuid,
      pro_uuid: this.producto.pro_uuid || '',
      prov_uuid: this.producto.prov_uuid,
      usr_uuid: this.activeCustomer?.usr_uuid || '',
      cus_uuid: this.activeCustomer?.cus_uuid || '',
      provrev_rating: this.userRating,
      provrev_comment: this.userComment,
      provrev_isverified: this.isVerifiedBuyer || false
    };
    
    // Add extra properties (author, avatar) for backend compatibility/caching
    const authorName = this.activeCustomer?.cus_fullname || this.activeCustomer?.cus_name || this.activeCustomer?.usr_name || 'Comprador Anónimo';
    (reviewData as any).provrev_author = authorName;
    (reviewData as any).provrev_avatar = authorName.substring(0, 2).toUpperCase();

    this._reviewsService.saveProductVariationReview(reviewData).subscribe({
      next: (res) => {
        this.message.success('¡Muchas gracias! Tu reseña ha sido publicada con éxito.');
        this.userComment = '';
        this.userRating = 5;
        this.isSubmittingReview = false;
        
        // Reload reviews from the database
        this.loadProductReviews(this.productId);
      },
      error: (err) => {
        console.error('Error saving review to database:', err);
        this.message.error('No se pudo publicar la reseña en el servidor.');
        this.isSubmittingReview = false;
      }
    });
  }

  public getRatingPercentage(stars: number): number {
    const total = this.reviews.length;
    if (total === 0) return 0;
    const count = this.ratingDistribution[stars] || 0;
    return Math.round((count / total) * 100);
  }

  public navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
  }

  public scrollToBuy(): void {
    const element = document.querySelector('.detail-price-box');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  public getProductUrl(medium?: string): string {
    let url = window.location.href;
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      
      if (medium) {
        urlObj.searchParams.set('utm_source', 'user_share');
        urlObj.searchParams.set('utm_medium', medium);
        urlObj.searchParams.set('utm_campaign', 'product_detail');
      }
      return urlObj.toString();
    } catch (e) {
      console.error('Error parsing URL:', e);
      return url;
    }
  }

  public shareOnWhatsApp(): void {
    if (!this.producto) return;
    const url = encodeURIComponent(this.getProductUrl('whatsapp'));
    const text = encodeURIComponent(`¡Mirá este producto en ATS Market! ${this.producto.prov_name} - `);
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
  }

  public shareOnFacebook(): void {
    const url = encodeURIComponent(this.getProductUrl('facebook'));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  public shareOnTelegram(): void {
    if (!this.producto) return;
    const url = encodeURIComponent(this.getProductUrl('telegram'));
    const text = encodeURIComponent(`¡Mirá este producto en ATS Market! ${this.producto.prov_name}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }

  public copyToClipboard(): void {
    const url = this.getProductUrl('clipboard');
    navigator.clipboard.writeText(url).then(() => {
      this.message.success('¡Enlace copiado al portapapeles! Listo para compartir en Instagram o redes.');
    }).catch(err => {
      console.error('Error al copiar el enlace:', err);
      this.message.error('No se pudo copiar el enlace automáticamente.');
    });
  }

  public shareGeneral(): void {
    if (!this.producto) return;
    const url = this.getProductUrl('general');
    const title = this.producto.prov_name;
    const text = this.producto.prov_description || 'Detalle del producto en ATS Market';

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      }).then(() => {
        console.info('Compartido con éxito');
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error al compartir nativamente:', err);
          this.copyToClipboard();
        }
      });
    } else {
      this.copyToClipboard();
    }
  }

  private updateMetaTags(producto: ProductVariationInterface): void {
    if (!producto) return;
    
    // Titulo de la página
    this.titleService.setTitle(`${producto.prov_name} | ATS Market`);

    // Descripción clásica
    const desc = producto.prov_description || 'Detalle del producto en ATS Market. Elaborado artesanalmente bajo estándares premium de la marca.';
    this.metaService.updateTag({ name: 'description', content: desc });

    // Open Graph (WhatsApp, Facebook, etc.)
    const pageUrl = this.getProductUrl();
    this.metaService.updateTag({ property: 'og:title', content: producto.prov_name });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ property: 'og:image', content: producto.prov_image || 'https://placehold.co/400x400/eeeeee/8c8c8c?text=Sin+Foto' });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'product' });

    // Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: producto.prov_name });
    this.metaService.updateTag({ name: 'twitter:description', content: desc });
    this.metaService.updateTag({ name: 'twitter:image', content: producto.prov_image || 'https://placehold.co/400x400/eeeeee/8c8c8c?text=Sin+Foto' });
  }
}
