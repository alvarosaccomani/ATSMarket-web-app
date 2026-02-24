import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistPriceListComponent } from './dist-price-list.component';

describe('DistPriceListComponent', () => {
  let component: DistPriceListComponent;
  let fixture: ComponentFixture<DistPriceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistPriceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
