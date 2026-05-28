import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { merchantGuard } from './merchant.guard';

describe('merchantGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => merchantGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
