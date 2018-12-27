import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaPage } from './venta.page';

describe('VentaPage', () => {
  let component: VentaPage;
  let fixture: ComponentFixture<VentaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
