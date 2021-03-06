import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'logueo', loadChildren: './logueo/logueo.module#LogueoPageModule' },
  { path: 'reporte-producto', loadChildren: './reporte-producto/reporte-producto.module#ReporteProductoPageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
