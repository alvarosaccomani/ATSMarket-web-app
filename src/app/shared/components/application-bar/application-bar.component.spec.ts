import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationBarComponent } from './application-bar.component';

describe('ApplicationBarComponent', () => {
  let component: ApplicationBarComponent;
  let fixture: ComponentFixture<ApplicationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
