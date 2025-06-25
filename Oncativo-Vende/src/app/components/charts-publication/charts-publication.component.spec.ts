import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsPublicationComponent } from './charts-publication.component';

describe('ChartsPublicationComponent', () => {
  let component: ChartsPublicationComponent;
  let fixture: ComponentFixture<ChartsPublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartsPublicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartsPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
