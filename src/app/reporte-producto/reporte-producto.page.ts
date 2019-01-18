import { Component, OnInit } from '@angular/core';
import { ReporteProductoOptions } from '../reporte-producto-options';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController, MenuController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { CalendarioPage } from '../calendario/calendario.page';
import { VentaOptions } from '../venta-options';

@Component({
  selector: 'app-reporte-producto',
  templateUrl: './reporte-producto.page.html',
  styleUrls: ['./reporte-producto.page.scss'],
})
export class ReporteProductoPage implements OnInit {

  public filtros = [
    'DIARIO',
    'SEMANAL',
    'MENSUAL',
    'ANUAL'
  ];

  public reporte: ReporteProductoOptions;
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
    const fecha = seleccionado.fecha;
    const fechaInicio = moment(fecha).startOf('month').toDate();
    const fechaFin = moment(fecha).endOf('month').toDate();
    this.fecha = fechaInicio;
    this.updateReporteMensual(fechaInicio, fechaFin);
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
    const fechaInicio = anno.startOf('year').toDate();
    const fechaFin = anno.endOf('year').toDate();
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
        const fechaInicio = moment(this.fecha).startOf('month').toDate();
        const fechaFin = moment(this.fecha).endOf('month').toDate();
        this.updateReporteMensual(fechaInicio, fechaFin);
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
        const detalleReporte = this.reporte.detalle;
        const productosVenta = venta.detalle;
        productosVenta.forEach(productoVenta => {
          const reporteProducto = detalleReporte.find(reporte => reporte.producto.id === productoVenta.producto.id);
          if (reporteProducto) {
            reporteProducto.cantidad += reporteProducto.cantidad;
          } else {
            detalleReporte.push({
              cantidad: productoVenta.cantidad,
              producto: productoVenta.producto
            });
          }
        });
      });

      const detalleReporte = this.reporte.detalle;

      detalleReporte.sort((a, b) => {
        if (Number(a.cantidad) < Number(b.cantidad)) {
          return 1;
        } else if (Number(a.cantidad) > Number(b.cantidad)) {
          return -1;
        } else {
          return 0;
        }
      });

      this.reporte.mayor = detalleReporte[0];
      this.reporte.menor = detalleReporte[0] ? detalleReporte[detalleReporte.length - 1] : null;
    });
  }

  private async updateReporteSemanal(fechaInicio: Date, fechaFin: Date) {
    this.iniciarReporte();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const promise = this.loadReporteFecha(fecha).then(ventas => {
        ventas.forEach(venta => {
          const detalleReporte = this.reporte.detalle;
          const productosVenta = venta.detalle;
          productosVenta.forEach(productoVenta => {
            const reporteProducto = detalleReporte.find(reporte => reporte.producto.id === productoVenta.producto.id);
            if (reporteProducto) {
              reporteProducto.cantidad += reporteProducto.cantidad;
            } else {
              detalleReporte.push({
                cantidad: productoVenta.cantidad,
                producto: productoVenta.producto
              });
            }
          });
        });

        const detalleReporte = this.reporte.detalle;

        detalleReporte.sort((a, b) => {
          if (Number(a.cantidad) < Number(b.cantidad)) {
            return 1;
          } else if (Number(a.cantidad) > Number(b.cantidad)) {
            return -1;
          } else {
            return 0;
          }
        });

        this.reporte.mayor = detalleReporte[0];
        this.reporte.menor = detalleReporte[0] ? detalleReporte[detalleReporte.length - 1] : null;
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

  private async updateReporteMensual(fechaInicio: Date, fechaFin: Date) {
    this.iniciarReporte();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const promise = this.loadReporteFecha(fecha).then(ventas => {
        ventas.forEach(venta => {
          const detalleReporte = this.reporte.detalle;
          const productosVenta = venta.detalle;
          productosVenta.forEach(productoVenta => {
            const reporteProducto = detalleReporte.find(reporte => reporte.producto.id === productoVenta.producto.id);
            if (reporteProducto) {
              reporteProducto.cantidad += reporteProducto.cantidad;
            } else {
              detalleReporte.push({
                cantidad: productoVenta.cantidad,
                producto: productoVenta.producto
              });
            }
          });
        });

        const detalleReporte = this.reporte.detalle;

        detalleReporte.sort((a, b) => {
          if (Number(a.cantidad) < Number(b.cantidad)) {
            return 1;
          } else if (Number(a.cantidad) > Number(b.cantidad)) {
            return -1;
          } else {
            return 0;
          }
        });

        this.reporte.mayor = detalleReporte[0];
        this.reporte.menor = detalleReporte[0] ? detalleReporte[detalleReporte.length - 1] : null;
      });
      await promise;
      fecha = moment(fecha).add(1, 'days').toDate();
    }
  }

  private async updateReporteAnual(fechaInicio: Date, fechaFin: Date) {
    this.iniciarReporte();
    let fecha = fechaInicio;
    while (fecha <= fechaFin) {
      const promise = this.loadReporteFecha(fecha).then(ventas => {
        ventas.forEach(venta => {
          const detalleReporte = this.reporte.detalle;
          const productosVenta = venta.detalle;
          productosVenta.forEach(productoVenta => {
            const reporteProducto = detalleReporte.find(reporte => reporte.producto.id === productoVenta.producto.id);
            if (reporteProducto) {
              reporteProducto.cantidad += reporteProducto.cantidad;
            } else {
              detalleReporte.push({
                cantidad: productoVenta.cantidad,
                producto: productoVenta.producto
              });
            }
          });
        });

        const detalleReporte = this.reporte.detalle;

        detalleReporte.sort((a, b) => {
          if (Number(a.cantidad) < Number(b.cantidad)) {
            return 1;
          } else if (Number(a.cantidad) > Number(b.cantidad)) {
            return -1;
          } else {
            return 0;
          }
        });

        this.reporte.mayor = detalleReporte[0];
        this.reporte.menor = detalleReporte[0] ? detalleReporte[detalleReporte.length - 1] : null;
      });
      await promise;
      fecha = moment(fecha).add(1, 'days').toDate();
    }
  }

  private iniciarReporte() {
    this.reporte = {
      mayor: {} as any,
      menor: {} as any,
      detalle: [] as any
    };
  }

}
