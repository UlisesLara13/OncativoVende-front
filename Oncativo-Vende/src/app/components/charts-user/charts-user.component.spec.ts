import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsUserComponent } from './charts-user.component';

describe('ChartsUserComponent', () => {
  let component: ChartsUserComponent;
  let fixture: ComponentFixture<ChartsUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartsUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartsUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
