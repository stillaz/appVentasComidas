import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DatePickerModule } from 'ionic4-date-picker';

import { IonicModule } from '@ionic/angular';

import { CalendarioPage } from './calendario.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarioPage
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
  declarations: [CalendarioPage]
})
export class CalendarioPageModule { }
