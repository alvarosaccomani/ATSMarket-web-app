import { TestBed } from '@angular/core/testing';

import { StockMovementsService } from './stock-movements.service';

describe('StockMovementsService', () => {
  let service: StockMovementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockMovementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
