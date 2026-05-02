import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCategoriesComponent } from './global-categories.component';

describe('GlobalCategoriesComponent', () => {
  let component: GlobalCategoriesComponent;
  let fixture: ComponentFixture<GlobalCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
