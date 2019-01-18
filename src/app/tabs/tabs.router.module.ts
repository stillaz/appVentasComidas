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
        loadChildren: '../producto/producto.module#ProductoPageModule'
      }, {
        path: 'venta',
        children: [{
          path: 'detalle',
          loadChildren: '../detalle-venta/detalle-venta.module#DetalleVentaPageModule'
        }, {
          path: 'reporte',
          children: [
            {
              path: '',
              loadChildren: '../reporte/reporte.module#ReportePageModule'
            }, {
              path: 'detalle',
              loadChildren: '../detalle-reporte/detalle-reporte.module#DetalleReportePageModule'
            }
          ]
        }, {
          path: 'reporte-producto',
          loadChildren: '../reporte-producto/reporte-producto.module#ReporteProductoPageModule'
        }, {
          path: '',
          loadChildren: '../venta/venta.module#VentaPageModule'
        }]
      },
      {
        path: 'configuracion',
        children: [{
          path: '',
          loadChildren: '../configuracion/configuracion.module#ConfiguracionPageModule'
        }, {
          path: 'grupo',
          loadChildren: '../grupo/grupo.module#GrupoPageModule'
        }, {
          path: 'usuario',
          loadChildren: '../detalle-usuario/detalle-usuario.module#DetalleUsuarioPageModule'
        }]
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
