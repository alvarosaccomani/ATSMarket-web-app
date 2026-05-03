import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCategoryComponent } from './global-category.component';

describe('GlobalCategoryComponent', () => {
  let component: GlobalCategoryComponent;
  let fixture: ComponentFixture<GlobalCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
