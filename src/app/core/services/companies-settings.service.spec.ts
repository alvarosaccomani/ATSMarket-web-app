import { TestBed } from '@angular/core/testing';

import { CompaniesSettingsService } from './companies-settings.service';

describe('CompaniesSettingsService', () => {
  let service: CompaniesSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompaniesSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
