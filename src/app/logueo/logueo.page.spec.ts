import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogueoPage } from './logueo.page';

describe('LogueoPage', () => {
  let component: LogueoPage;
  let fixture: ComponentFixture<LogueoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogueoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogueoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
