import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'producto',
        children: [
          {
            path: '',
            loadChildren: '../producto/producto.module#ProductoPageModule'
          }
        ]
      },
      {
        path: 'venta',
        children: [
          {
            path: '',
            loadChildren: '../venta/venta.module#VentaPageModule'
          }
        ]
      },
      {
        path: 'configuracion',
        children: [
          {
            path: '',
            loadChildren: '../configuracion/configuracion.module#ConfiguracionPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/producto',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/producto',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }