import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMaterialsComponent } from './global-materials.component';

describe('GlobalMaterialsComponent', () => {
  let component: GlobalMaterialsComponent;
  let fixture: ComponentFixture<GlobalMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalMaterialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
