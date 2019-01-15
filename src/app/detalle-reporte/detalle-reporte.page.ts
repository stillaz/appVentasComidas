import { Component, OnInit } from '@angular/core';
import { NavParams, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { VentaOptions } from '../venta-options';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-reporte',
  templateUrl: './detalle-reporte.page.html',
  styleUrls: ['./detalle-reporte.page.scss'],
})
export class DetalleReportePage implements OnInit {

  public idusuario: string;
  public fecha: Date;
  public reporte: {
    detalle: [{
      fecha: string,
      ventas: VentaOptions[]
    }],
    cantidad: number,
    total: number
  };

  constructor(
    public navController: NavController,
    private angularFirestore: AngularFirestore,
    private activeRouter: ActivatedRoute
  ) { }

  ngOnInit() {
    this.idusuario = this.activeRouter.snapshot.paramMap.get('idusuario');
    this.fecha = new Date(Number(this.activeRouter.snapshot.paramMap.get('fecha')));
    this.reporte = {
      cantidad: 0,
      detalle: [] as any,
      total: 0
    };
    this.updateVentasUsuario();
  }

  private async updateVentasUsuario() {
    const fechaInicio = moment(this.fecha).startOf('month').toDate();
    const fechaFin = moment(this.fecha).endOf('month').toDate();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const texto = moment(fecha).locale('es').format('dddd, DD')
      const promise = this.loadVentasDiaUsuario(fecha.toTimeString()).then(ventas => {
        if (ventas[0]) {
          this.reporte.detalle.push({ fecha: texto, ventas: ventas });
          this.reporte.cantidad += ventas.length;
          this.reporte.total += ventas.map(venta => venta.recibido).reduce((a, b) => a + b);
        }
      });
      await promise;
      fecha = moment(fecha).add(1, 'day').toDate();
    }
  }

  private async loadVentasDiaUsuario(idfecha: string) {
    const ventasDiaCollection = this.angularFirestore.collection<VentaOptions>(`ventas/${idfecha}/ventas`, ref => ref.where('usuario.id', '==', this.idusuario));
    return new Promise<VentaOptions[]>(resolve => {
      ventasDiaCollection.valueChanges().subscribe(ventas => {
        resolve(ventas);
      });
    });
  }

}
