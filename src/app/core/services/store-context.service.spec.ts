import { TestBed } from '@angular/core/testing';

import { StoreContextService } from './store-context.service';

describe('StoreContextService', () => {
  let service: StoreContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
