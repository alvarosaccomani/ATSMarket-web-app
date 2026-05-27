import { TestBed } from '@angular/core/testing';

import { InventoryStocksService } from './inventory-stocks.service';

describe('InventoryStocksService', () => {
  let service: InventoryStocksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryStocksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
