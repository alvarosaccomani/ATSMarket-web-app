import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRolCompanyComponent } from './user-rol-company.component';

describe('UserRolCompanyComponent', () => {
  let component: UserRolCompanyComponent;
  let fixture: ComponentFixture<UserRolCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRolCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRolCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
