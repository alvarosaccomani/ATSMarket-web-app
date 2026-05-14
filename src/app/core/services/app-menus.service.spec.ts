import { TestBed } from '@angular/core/testing';

import { AppMenusService } from './app-menus.service';

describe('AppMenusService', () => {
  let service: AppMenusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppMenusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
