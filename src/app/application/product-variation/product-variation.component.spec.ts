import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariationComponent } from './product-variation.component';

describe('ProductVariationComponent', () => {
  let component: ProductVariationComponent;
  let fixture: ComponentFixture<ProductVariationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductVariationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
