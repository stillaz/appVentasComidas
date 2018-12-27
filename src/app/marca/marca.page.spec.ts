import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcaPage } from './marca.page';

describe('MarcaPage', () => {
  let component: MarcaPage;
  let fixture: ComponentFixture<MarcaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarcaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
