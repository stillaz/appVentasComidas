import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteProductoPage } from './reporte-producto.page';

describe('ReporteProductoPage', () => {
  let component: ReporteProductoPage;
  let fixture: ComponentFixture<ReporteProductoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteProductoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
