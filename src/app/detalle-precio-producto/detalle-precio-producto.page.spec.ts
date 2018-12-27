import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePrecioProductoPage } from './detalle-precio-producto.page';

describe('DetallePrecioProductoPage', () => {
  let component: DetallePrecioProductoPage;
  let fixture: ComponentFixture<DetallePrecioProductoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetallePrecioProductoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePrecioProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
