import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountConfirmedComponent } from './account-confirmed.component';

describe('AccountConfirmedComponent', () => {
  let component: AccountConfirmedComponent;
  let fixture: ComponentFixture<AccountConfirmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountConfirmedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
