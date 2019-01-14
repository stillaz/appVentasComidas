import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { VentaOptions } from '../venta-options';
import { ReporteOptions } from '../reporte-options';

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
  public periocidad: string;
  public atras: boolean;
  public adelante: boolean;
  public fechas: [{
    fecha: Date,
    texto: string
  }];
  public mesSeleccionado: {
    fecha: Date,
    texto: string
  }

  constructor(private angularFirestore: AngularFirestore) { }

  ngOnInit() {
    this.updateFechaMes(0);
    this.updateReporte('MENSUAL');
  }

  public updateFechaMes(valor: number) {
    const fecha = this.mesSeleccionado ? this.mesSeleccionado.fecha : new Date();
    const fechaNueva = moment(fecha).add(valor, 'month').toDate();
    this.updateFechasMes(fechaNueva);
    this.adelante = moment(new Date()).diff(this.mesSeleccionado.fecha, "month") !== 0;
    this.atras = moment(this.mesSeleccionado.fecha).get("month") !== 1;
    this.updateReporte('MENSUAL');
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

  updateSeleccionadoMes(seleccionado: {
    fecha: Date,
    texto: string
  }) {
    this.adelante = moment(new Date()).diff(seleccionado.fecha, "month") !== 0;
    this.atras = moment(seleccionado.fecha).get("month") !== 1;
    this.updateReporteMensual(seleccionado.fecha);
  }

  public updateReporte(filtro: string) {
    this.periocidad = filtro;
    switch (filtro) {
      case 'DIARIO':
        this.updateReporteDiario(new Date());
        break;
      case 'SEMANAL':
        this.updateReporteSemanal(new Date(), new Date());
        break;
      case 'MENSUAL':
        this.updateReporteMensual(new Date());
        break;
      case 'ANUAL':
        this.updateReporteAnual(new Date(), new Date());
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
          this.reporte.total += venta.recibido;
          const detalleReporte = this.reporte.detalle;
          const usuarioVenta = venta.usuario;
          const reporteUsuario = detalleReporte.find(reporte => reporte.usuario.id === usuarioVenta.id);
          if (reporteUsuario) {
            reporteUsuario.cantidad += venta.cantidad;
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
      fecha = moment(fecha).add(1, 'month').toDate();
    }
  }

  private async loadReporteFechaMes(fecha: Date) {
    const idFecha = moment(fecha).startOf('month').toDate().getTime();
    return new Promise<any[]>(resolve => {
      const ventasDiaCollection = this.angularFirestore.collection<any>(`reportes/${idFecha}`);
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
