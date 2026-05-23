import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAuditComponent } from './inventory-audit.component';

describe('InventoryAuditComponent', () => {
  let component: InventoryAuditComponent;
  let fixture: ComponentFixture<InventoryAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
