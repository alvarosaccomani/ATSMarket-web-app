import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpPaymentBrickComponent } from './mp-payment-brick.component';

describe('MpPaymentBrickComponent', () => {
  let component: MpPaymentBrickComponent;
  let fixture: ComponentFixture<MpPaymentBrickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpPaymentBrickComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpPaymentBrickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
