import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePage } from './reporte.page';

describe('ReportePage', () => {
  let component: ReportePage;
  let fixture: ComponentFixture<ReportePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
