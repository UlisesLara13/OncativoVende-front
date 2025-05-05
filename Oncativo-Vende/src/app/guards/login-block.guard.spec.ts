import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loginBlockGuard } from './login-block.guard';

describe('loginBlockGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loginBlockGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
