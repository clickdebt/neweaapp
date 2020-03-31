import { TestBed } from '@angular/core/testing';

import { CaseActionService } from './case-action.service';

describe('CaseActionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaseActionService = TestBed.get(CaseActionService);
    expect(service).toBeTruthy();
  });
});
