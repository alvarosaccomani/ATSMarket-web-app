import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMaterialComponent } from './global-material.component';

describe('GlobalMaterialComponent', () => {
  let component: GlobalMaterialComponent;
  let fixture: ComponentFixture<GlobalMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalMaterialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
