import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsVariationsComponent } from './products-variations.component';

describe('ProductsVariationsComponent', () => {
  let component: ProductsVariationsComponent;
  let fixture: ComponentFixture<ProductsVariationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsVariationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsVariationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
