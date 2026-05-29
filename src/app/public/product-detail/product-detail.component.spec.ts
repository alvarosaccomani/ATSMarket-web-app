import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '@services/cart.service';
import { ProductVariationsService } from '@services/product-variations.service';
import { SessionService } from '@services/session.service';
import { OrdersService } from '@services/orders.service';
import { StoreContextService } from '@services/store-context.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => {
          if (key === 'slug') return 'test-store';
          if (key === 'id') return 'test-product-uuid';
          return null;
        }
      })
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const mockCartService = {
      addToCart: jasmine.createSpy('addToCart')
    };

    const mockProductVariationsService = {
      getProductsVariations: () => of({ data: [] })
    };

    const mockSessionService = {
      getCurrentSession: () => ({ customer: { cus_uuid: '123', cus_name: 'Test' } })
    };

    const mockOrdersService = {
      getOrdersByCustomer: () => of({ data: [] })
    };

    const mockStoreContextService = {
      activeStore$: of({ cmp_uuid: 'comp-123' }),
      storeSettings$: of({}),
      getSetting: (key: string, defVal: any) => defVal,
      setStoreBySlug: () => of({ cmp_uuid: 'comp-123' })
    };

    const mockNzMessageService = {
      success: jasmine.createSpy('success'),
      warning: jasmine.createSpy('warning'),
      error: jasmine.createSpy('error')
    };

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        ProductDetailComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: CartService, useValue: mockCartService },
        { provide: ProductVariationsService, useValue: mockProductVariationsService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: StoreContextService, useValue: mockStoreContextService },
        { provide: NzMessageService, useValue: mockNzMessageService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
