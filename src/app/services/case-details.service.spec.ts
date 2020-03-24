import { TestBed } from '@angular/core/testing';

import { CaseDetailsService } from './case-details.service';

describe('CaseDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaseDetailsService = TestBed.get(CaseDetailsService);
    expect(service).toBeTruthy();
  });
});
