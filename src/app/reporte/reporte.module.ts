import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReportePage } from './reporte.page';
import { DatePickerModule } from 'ionic4-date-picker';

const routes: Routes = [
  {
    path: '',
    component: ReportePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    DatePickerModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportePage]
})
export class ReportePageModule {}
