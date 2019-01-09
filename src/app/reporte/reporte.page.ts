import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
})
export class ReportePage implements OnInit {

  public filtros = [
    'DIARIO',
    'SEMANAL',
    'MENSUAL',
    'ANUAL'
  ];

  constructor() { }

  ngOnInit() {
  }

}
