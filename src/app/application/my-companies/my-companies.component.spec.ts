import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCompaniesComponent } from './my-companies.component';

describe('MyCompaniesComponent', () => {
  let component: MyCompaniesComponent;
  let fixture: ComponentFixture<MyCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCompaniesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
