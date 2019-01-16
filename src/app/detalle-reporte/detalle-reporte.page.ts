import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { VentaOptions } from '../venta-options';
import { ActivatedRoute } from '@angular/router';
import { UsuarioOptions } from '../usuario-options';

@Component({
  selector: 'app-detalle-reporte',
  templateUrl: './detalle-reporte.page.html',
  styleUrls: ['./detalle-reporte.page.scss'],
})
export class DetalleReportePage implements OnInit {

  public idusuario: string;
  public fecha: Date;
  public usuario: UsuarioOptions;
  public reporte: {
    detalle: [{
      fecha: string,
      ventas: VentaOptions[]
    }],
    cantidad: number,
    total: number
  };
  public fechas: [{
    fecha: Date,
    texto: string
  }];
  public mesSeleccionado: {
    fecha: Date,
    texto: string
  };

  public customActionSheetOptions = {
    cssClass: 'actionMes'
  };

  constructor(
    public navController: NavController,
    private angularFirestore: AngularFirestore,
    private activeRouter: ActivatedRoute,
    public loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.idusuario = this.activeRouter.snapshot.paramMap.get('idusuario');
    this.fecha = new Date(Number(this.activeRouter.snapshot.paramMap.get('fecha')));
    if (!this.idusuario || !this.fecha) {
      this.navController.navigateRoot('tabs/ventas');
    }
    this.initReporte();
    this.updateUsuario();
    this.updateVentasUsuario();
    this.updateFechasMes(this.fecha);
  }

  public initReporte() {
    this.reporte = {
      cantidad: 0,
      detalle: [] as any,
      total: 0
    };
  }

  public updateFechasMes(fechaSeleccionada: Date) {
    this.fechas = [] as any;
    const actual = moment(fechaSeleccionada).startOf("month");
    const fechaInicio = moment(fechaSeleccionada).add(-1, "years");
    let fecha = actual.startOf("month");
    const texto = fecha.locale("es").format("MMMM - YYYY").toLocaleUpperCase();
    this.mesSeleccionado = { fecha: actual.toDate(), texto: texto };

    this.fechas.push(this.mesSeleccionado);
    while (fecha.diff(fechaInicio) > 0) {
      fecha = fecha.add(-1, "month");
      let texto = fecha.locale("es").format("MMMM - YYYY").toLocaleUpperCase();
      this.fechas.push({ fecha: fecha.toDate(), texto: texto });
    }
  }

  public seleccionarMes(seleccionado: any) {
    this.initReporte();
    this.fecha = seleccionado.fecha;
    this.updateVentasUsuario();
  }

  private updateUsuario() {
    const usuarioDoc = this.angularFirestore.doc<UsuarioOptions>(`usuarios/${this.idusuario}`);
    usuarioDoc.valueChanges().subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  private async updateVentasUsuario() {
    const fechaInicio = moment(this.fecha).startOf('month').toDate();
    const fechaFin = moment(this.fecha).endOf('month').toDate();
    const loading = await this.loadingController.create({
      message: 'Procesando...',
      duration: 2000,
      translucent: true,
      showBackdrop: true
    });

    loading.present();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const texto = moment(fecha).locale('es').format('dddd, DD')
      const promise = this.loadVentasDiaUsuario(fecha.getTime().toString()).then(ventas => {
        if (ventas[0]) {
          this.reporte.detalle.push({ fecha: texto, ventas: ventas });
          this.reporte.cantidad += ventas.length;
          this.reporte.total += ventas.map(venta => venta.recibido).reduce((a, b) => a + b);
        }
      });
      await promise;
      fecha = moment(fecha).add(1, 'day').toDate();
    }

    loading.dismiss();
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
