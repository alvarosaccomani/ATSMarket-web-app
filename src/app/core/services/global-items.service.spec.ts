import { TestBed } from '@angular/core/testing';

import { GlobalItemsService } from './global-items.service';

describe('GlobalItemsService', () => {
  let service: GlobalItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
