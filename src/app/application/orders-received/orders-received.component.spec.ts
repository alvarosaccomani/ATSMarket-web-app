import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersReceivedComponent } from './orders-received.component';

describe('OrdersReceivedComponent', () => {
  let component: OrdersReceivedComponent;
  let fixture: ComponentFixture<OrdersReceivedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersReceivedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
