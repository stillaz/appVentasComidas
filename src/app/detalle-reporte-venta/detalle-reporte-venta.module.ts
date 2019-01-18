import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetalleReporteVentaPage } from './detalle-reporte-venta.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleReporteVentaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DetalleReporteVentaPage]
})
export class DetalleReporteVentaPageModule {}
