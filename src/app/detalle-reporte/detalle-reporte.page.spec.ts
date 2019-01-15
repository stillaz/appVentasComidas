import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleReportePage } from './detalle-reporte.page';

describe('DetalleReportePage', () => {
  let component: DetalleReportePage;
  let fixture: ComponentFixture<DetalleReportePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleReportePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleReportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
