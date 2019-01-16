import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { VentaOptions } from '../venta-options';
import { ReporteOptions } from '../reporte-options';
import { ModalController, MenuController, NavController } from '@ionic/angular';
import { CalendarioPage } from '../calendario/calendario.page';

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

  public reporte: ReporteOptions;
  public adelante: boolean;
  public atras = true;
  public anno: string;
  public periocidad: string;
  public semana: string;
  public fecha: Date;
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
    private angularFirestore: AngularFirestore,
    public modalController: ModalController,
    private menuController: MenuController,
    public navController: NavController
  ) { }

  ngOnInit() {
    this.fecha = new Date();
    this.updateFechasMes(new Date());
    this.updateReporte('MENSUAL');
  }

  public ver(idusuario: string) {
    this.navController.navigateForward(['tabs/venta/reporte/detalle', {
      idusuario: idusuario,
      fecha: this.fecha.getTime().toString()
    }]);
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
    this.updateReporteMensual(seleccionado.fecha);
  }

  public seleccionarFecha() {
    this.presentModalCalendario();
  }

  public seleccionarSemana(valor: number) {
    const diaSemana = moment(this.fecha).add(valor, 'week');
    const fechaInicio = diaSemana.startOf('week').add(1, 'day').toDate();
    const fechaFin = diaSemana.endOf('week').add(1, 'day').toDate();
    const textoInicio = moment(fechaInicio).locale('es').format('[Del] DD ');
    const textoFin = moment(fechaFin).locale('es').format('[al] DD [de] MMMM [de] YYYY');
    this.semana = `${textoInicio} ${textoFin}`.toLocaleUpperCase();
    this.adelante = fechaFin < new Date();
    this.fecha = fechaInicio;
    this.updateReporteSemanal(fechaInicio, fechaFin);
  }

  public seleccionarAnno(valor: number) {
    const anno = moment(this.fecha).add(valor, 'year');
    const fechaInicio = anno.startOf('month').toDate();
    const fechaFin = anno.endOf('month').toDate();
    this.anno = anno.year().toString();
    this.adelante = fechaFin < new Date();
    this.fecha = fechaInicio;
    this.updateReporteAnual(fechaInicio, fechaFin);
  }

  private async presentModalCalendario() {
    const modal = await this.modalController.create({
      component: CalendarioPage,
      componentProps: {
        fecha: this.fecha
      }
    });

    modal.onDidDismiss().then(res => {
      const data = res.data;
      if (data) {
        this.fecha = data.fecha;
        this.updateReporteDiario(this.fecha);
      }
    });

    await modal.present();
  }

  public updateReporte(filtro: string) {
    this.menuController.close();
    this.fecha = new Date();
    this.periocidad = filtro;
    switch (filtro) {
      case 'DIARIO':
        this.updateReporteDiario(this.fecha);
        break;
      case 'SEMANAL':
        this.seleccionarSemana(0);
        break;
      case 'MENSUAL':
        this.updateReporteMensual(this.fecha);
        break;
      case 'ANUAL':
        this.seleccionarAnno(0);
        break;
    }
  }

  private updateReporteDiario(fecha: Date) {
    const idFecha = moment(fecha).startOf('day').toDate().getTime();
    const ventasCollection = this.angularFirestore.collection<VentaOptions>(`ventas/${idFecha}/ventas`);
    ventasCollection.valueChanges().subscribe(ventas => {
      this.iniciarReporte();
      ventas.forEach(venta => {
        this.reporte.cantidad++;
        this.reporte.total += venta.recibido;
        const detalleReporte = this.reporte.detalle;
        const usuarioVenta = venta.usuario;
        const reporteUsuario = detalleReporte.find(reporte => reporte.usuario.id === usuarioVenta.id);
        if (reporteUsuario) {
          reporteUsuario.cantidad++;
          reporteUsuario.total += venta.recibido;
        } else {
          detalleReporte.push({
            cantidad: 1,
            total: venta.recibido,
            usuario: usuarioVenta
          });
        }
      });
    });
  }

  private async updateReporteSemanal(fechaInicio: Date, fechaFin: Date) {
    this.iniciarReporte();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const promise = this.loadReporteFecha(fecha).then(ventas => {
        ventas.forEach(venta => {
          this.reporte.cantidad++;
          this.reporte.total += venta.recibido;
          const detalleReporte = this.reporte.detalle;
          const usuarioVenta = venta.usuario;
          const reporteUsuario = detalleReporte.find(reporte => reporte.usuario.id === usuarioVenta.id);
          if (reporteUsuario) {
            reporteUsuario.cantidad++;
            reporteUsuario.total += venta.recibido;
          } else {
            detalleReporte.push({
              cantidad: 1,
              total: venta.recibido,
              usuario: usuarioVenta
            });
          }
        });
      });
      await promise;
      fecha = moment(fecha).add(1, 'days').toDate();
    }
  }

  private async loadReporteFecha(fecha: Date) {
    const idFecha = moment(fecha).startOf('day').toDate().getTime();
    return new Promise<VentaOptions[]>(resolve => {
      const ventasDiaCollection = this.angularFirestore.collection<VentaOptions>(`ventas/${idFecha}/ventas`);
      ventasDiaCollection.valueChanges().subscribe(ventas => {
        resolve(ventas);
      });
    });
  }

  private updateReporteMensual(fecha: Date) {
    const idMes = moment(fecha).startOf('month').toDate().getTime();
    const ventasMesCollection = this.angularFirestore.collection<any>(`reportes/${idMes}/ventas`);
    ventasMesCollection.valueChanges().subscribe(ventasUsuario => {
      this.iniciarReporte();
      ventasUsuario.forEach(venta => {
        this.reporte.cantidad += venta.cantidad;
        this.reporte.total += venta.total;
        const detalleReporte = this.reporte.detalle;
        const usuarioVenta = venta.usuario;
        detalleReporte.push({
          cantidad: venta.cantidad,
          total: venta.total,
          usuario: usuarioVenta
        });
      });
    });
  }

  private async updateReporteAnual(fechaInicio: Date, fechaFin: Date) {
    this.iniciarReporte();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const promise = this.loadReporteFechaMes(fecha).then(ventas => {
        ventas.forEach(venta => {
          this.reporte.cantidad += venta.cantidad;
          this.reporte.total += venta.total;
          const detalleReporte = this.reporte.detalle;
          detalleReporte.push({
            cantidad: venta.cantidad,
            total: venta.total,
            usuario: venta.usuario
          });
        });
      });
      await promise;
      fecha = moment(fecha).add(1, 'month').toDate();
    }
  }

  private async loadReporteFechaMes(fecha: Date) {
    const idFecha = moment(fecha).startOf('month').toDate().getTime();
    return new Promise<any[]>(resolve => {
      const ventasDiaCollection = this.angularFirestore.collection<any>(`reportes/${idFecha}/ventas`);
      ventasDiaCollection.valueChanges().subscribe(ventas => {
        resolve(ventas);
      });
    });
  }

  private iniciarReporte() {
    this.reporte = {
      cantidad: 0,
      detalle: [] as any,
      total: 0
    };
  }

}
