import { TestBed } from '@angular/core/testing';

import { SosService } from './sos.service';

describe('SosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SosService = TestBed.get(SosService);
    expect(service).toBeTruthy();
  });
});
