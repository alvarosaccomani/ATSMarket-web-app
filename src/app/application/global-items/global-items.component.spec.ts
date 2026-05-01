import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalItemsComponent } from './global-items.component';

describe('GlobalItemsComponent', () => {
  let component: GlobalItemsComponent;
  let fixture: ComponentFixture<GlobalItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
