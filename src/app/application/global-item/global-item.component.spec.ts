import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalItemComponent } from './global-item.component';

describe('GlobalItemComponent', () => {
  let component: GlobalItemComponent;
  let fixture: ComponentFixture<GlobalItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
