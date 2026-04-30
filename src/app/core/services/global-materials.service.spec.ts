import { TestBed } from '@angular/core/testing';

import { GlobalMaterialsService } from './global-materials.service';

describe('GlobalMaterialsService', () => {
  let service: GlobalMaterialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalMaterialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
