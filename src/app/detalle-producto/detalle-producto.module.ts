import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetalleProductoPage } from './detalle-producto.page';
import { PipesModule } from '../pipes.module';

const routes: Routes = [
  {
    path: '',
    component: DetalleProductoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PipesModule
  ],
  declarations: [DetalleProductoPage],
})
export class DetalleProductoPageModule { }
