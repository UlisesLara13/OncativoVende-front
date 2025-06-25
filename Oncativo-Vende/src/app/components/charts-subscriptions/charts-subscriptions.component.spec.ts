import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsSubscriptionsComponent } from './charts-subscriptions.component';

describe('ChartsSubscriptionsComponent', () => {
  let component: ChartsSubscriptionsComponent;
  let fixture: ComponentFixture<ChartsSubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartsSubscriptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartsSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
