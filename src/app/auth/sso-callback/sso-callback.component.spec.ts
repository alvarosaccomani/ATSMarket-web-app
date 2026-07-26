import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoCallbackComponent } from './sso-callback.component';

describe('SsoCallbackComponent', () => {
  let component: SsoCallbackComponent;
  let fixture: ComponentFixture<SsoCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoCallbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SsoCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
