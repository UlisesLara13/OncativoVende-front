import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolveReportModalComponent } from './solve-report-modal.component';

describe('SolveReportModalComponent', () => {
  let component: SolveReportModalComponent;
  let fixture: ComponentFixture<SolveReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolveReportModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolveReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
