import { TestBed } from '@angular/core/testing';

import { CartrackerService } from './cartracker.service';

describe('CartrackerService', () => {
  let service: CartrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
