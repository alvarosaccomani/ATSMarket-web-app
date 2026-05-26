import { TestBed } from '@angular/core/testing';

import { WarehousesLocationsService } from './warehouses-locations.service';

describe('WarehousesLocationsService', () => {
  let service: WarehousesLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehousesLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
