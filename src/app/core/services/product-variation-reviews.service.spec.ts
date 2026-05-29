import { TestBed } from '@angular/core/testing';

import { ProductVariationReviewsService } from './product-variation-reviews.service';

describe('ProductVariationReviewsService', () => {
  let service: ProductVariationReviewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductVariationReviewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
