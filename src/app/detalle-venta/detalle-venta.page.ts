import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GrupoOptions } from '../grupo-options';
import { ProductoOptions } from '../producto-options';
import { VentaOptions } from '../venta-options';
import { EstadoVenta } from '../estado-venta.enum';
import { AlertController, NavController, ToastController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.page.html',
  styleUrls: ['./detalle-venta.page.scss'],
})
export class DetalleVentaPage implements OnInit {

  public grupos: GrupoOptions[];
  public agrupar: boolean;
  private productos: ProductoOptions[];
  public gruposProducto: any;
  public venta: VentaOptions;

  constructor(
    private angularFirestore: AngularFirestore,
    public alertController: AlertController,
    public navController: NavController,
    public toastController: ToastController,
    private printer: Printer,
    public platform: Platform,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.updateGrupos();
    this.updateVenta();
  }

  private updateGrupos() {
    const grupoCollection = this.angularFirestore.collection<GrupoOptions>('grupos');
    grupoCollection.valueChanges().subscribe(grupos => {
      this.grupos = grupos;
    });
  }

  private updateVenta() {
    this.venta = {
      detalle: [] as any,
      devuelta: null,
      id: null,
      pago: null,
      total: 0,
      recibido: 0,
      estado: EstadoVenta.PENDIENTE,
      turno: null,
      fecha: null,
      usuario: this.usuarioService.getUsuario()
    };

    this.loadVenta().then(id => {
      this.venta.id = id;
    });
  }

  private loadVenta() {
    const turnoDoc = this.angularFirestore.doc<any>('configuracion/venta');
    return new Promise<number>((resolve, reject) => {
      turnoDoc.valueChanges().subscribe(venta => {
        if (venta) {
          resolve(Number(venta.id) + 1);
        } else {
          reject('No fue posible obtener los datos de venta');
        }
      });
    });
  }

  public updateProductosGrupo(event: any) {
    const seleccionado = event.detail.value;
    let productoCollection: AngularFirestoreCollection<ProductoOptions>;
    if (seleccionado == "0") {
      productoCollection = this.angularFirestore.collection('productos');
      this.agrupar = true;
    } else {
      productoCollection = this.angularFirestore.collection('productos', ref => ref.where('grupo.id', "==", seleccionado));
      this.agrupar = false;
    }

    this.updateProductos(productoCollection);
  }

  private updateProductos(productoCollection: AngularFirestoreCollection<ProductoOptions>) {
    productoCollection.valueChanges().subscribe(productos => {
      this.productos = productos;
      this.updateGruposProductos();
    });
  }

  private updateGruposProductos() {
    const grupos = [];
    this.gruposProducto = [];
    this.productos.forEach(producto => {
      const grupo = producto.grupo;
      if (grupos[grupo.id] === undefined) {
        grupos[grupo.id] = [];
      }
      grupos[grupo.id].push(producto);
    });

    for (let grupo in grupos) {
      const dataGrupo = this.grupos.find(todos => todos.id === grupo);
      this.gruposProducto.push({ grupo: dataGrupo, productos: grupos[grupo] });
    }
  }

  public agregar(producto: ProductoOptions) {
    const detalleFactura = this.venta.detalle;
    const item = detalleFactura.find(item => item.producto.id === producto.id);
    if (item) {
      item.cantidad++;
      item.subtotal = item.cantidad * item.producto.precio;
    } else {
      detalleFactura.push({ producto: producto, cantidad: 1, subtotal: producto.precio });
    }

    this.venta.total = detalleFactura.map(item => item.subtotal).reduce((a, b) => a + b);
  }

  public quitar(idproducto: string) {
    const detalleFactura = this.venta.detalle;
    const item = detalleFactura.find(item => item.producto.id === idproducto);
    const index = detalleFactura.indexOf(item);
    detalleFactura.splice(index, 1);

    this.venta.total = detalleFactura.length > 0 ? detalleFactura.map(item => item.subtotal).reduce((a, b) => a + b) : 0;
  }

  public terminar() {
    this.presentAlertPago();
  }

  async presentAlertPago() {
    const total = this.venta.total.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    const alert = await this.alertController.create({
      header: `Venta ${this.venta.id}`,
      subHeader: `Total compra ${total}`,
      message: 'Pago',
      inputs: [{
        name: 'pago',
        type: 'number',
        min: 0,
        max: this.venta.total,
        placeholder: '$ 0'
      }],
      buttons: [{
        text: 'Continuar',
        handler: data => {
          const pago = data.pago;
          this.venta.pago = pago;
          const devuelta = pago - this.venta.total;
          this.venta.devuelta = devuelta;
          this.venta.recibido = pago - devuelta;
          if (devuelta > 0) {
            this.presentAlertDevolucion();
          } else if (devuelta === 0) {
            this.finalizar();
          }
        }
      }, {
        text: 'Cancelar',
        role: 'cancel'
      }]
    });
    return await alert.present();
  }

  async presentAlertDevolucion() {
    const devolucion = this.venta.devuelta.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    const alert = await this.alertController.create({
      header: `Venta ${this.venta.id}`,
      subHeader: `Devolución ${devolucion}`,

      buttons: [{
        text: 'Continuar',
        handler: () => {
          this.finalizar();
        }
      }]
    });
    return await alert.present();
  }

  private finalizar() {
    this.loadTurno().then(idturno => {
      const fecha = new Date();
      const batch = this.angularFirestore.firestore.batch();
      this.venta.turno = idturno;
      this.venta.estado = EstadoVenta.PAGADO;
      this.venta.fecha = fecha;
      this.registrarVenta(batch, fecha);
    });
  }

  private registrarVenta(batch: firebase.firestore.WriteBatch, fecha: Date) {
    const recibido = this.venta.recibido;
    const fechaDia = moment(fecha).startOf('day').toDate().getTime().toString();
    const ventaDiaDoc = this.angularFirestore.doc<any>(`ventas/${fechaDia}`);
    const ventaDoc = ventaDiaDoc.collection('ventas').doc(this.venta.id.toString());
    ventaDiaDoc.ref.get().then(diario => {
      if (diario.exists) {
        const totalActual = diario.get('total');
        const total = Number(totalActual) + recibido;
        const cantidadActual = diario.get('cantidad');
        const cantidad = Number(cantidadActual) + 1;
        batch.update(ventaDiaDoc.ref, {
          total: total,
          cantidad: cantidad,
          fecha: fecha
        });
      } else {
        batch.set(ventaDiaDoc.ref, {
          total: recibido,
          cantidad: 1,
          fecha: fecha
        });
      }
      batch.set(ventaDoc.ref, this.venta);
      this.registrarReporte(batch, fecha);
    });
  }

  private registrarReporte(batch: firebase.firestore.WriteBatch, fecha: Date) {
    const recibido = this.venta.recibido;
    const fechaMes = moment(fecha).startOf('month').toDate().getTime().toString();
    const reporteDoc = this.angularFirestore.doc(`reportes/${fechaMes}`);
    const usuario = this.venta.usuario;
    const usuarioReporteDoc = reporteDoc.collection('ventas').doc(usuario.id);
    batch.set(reporteDoc.ref, { fecha: fecha });

    usuarioReporteDoc.ref.get().then(reporte => {
      if (reporte.exists) {
        const totalActual = reporte.get('total');
        const total = Number(totalActual) + recibido;
        const cantidadActual = reporte.get('cantidad');
        const cantidad = Number(cantidadActual) + 1;
        batch.update(usuarioReporteDoc.ref, {
          total: total,
          cantidad: cantidad,
          fecha: fecha
        });
      } else {
        batch.set(usuarioReporteDoc.ref, {
          total: recibido,
          cantidad: 1,
          fecha: fecha,
          usuario: usuario
        });
      }

      this.updateIDS(batch, fecha);
    });
  }

  private updateIDS(batch: firebase.firestore.WriteBatch, fecha: Date) {
    const turnoDoc = this.angularFirestore.doc('configuracion/turno');
    const ventaDDoc = this.angularFirestore.doc('configuracion/venta');
    batch.update(turnoDoc.ref, { id: this.venta.turno, actualizacion: fecha });
    batch.update(ventaDDoc.ref, { id: this.venta.id, actualizacion: fecha });
    batch.commit().then(() => {
      this.presentAlertFinalizar();
    }).catch(err => {
      this.presentAlertError(err, 'registrar');
    });
  }

  private loadTurno() {
    const turnoDoc = this.angularFirestore.doc<any>('configuracion/turno');
    return new Promise<number>((resolve, reject) => {
      turnoDoc.valueChanges().subscribe(turno => {
        if (turno) {
          const dif = moment(turno.actualizacion.toDate()).diff(new Date(), 'hours');
          if (dif < 4) {
            resolve(Number(turno.id) + 1);
          } else {
            resolve(1);
          }
        } else {
          reject('No fue posible obtener los datos del turno');
        }
      });
    });
  }

  async presentAlertFinalizar() {
    const alert = await this.alertController.create({
      header: `Venta ${this.venta.id}`,
      subHeader: `Turno ${this.venta.turno}`,
      buttons: [{
        text: 'Continuar',
        handler: () => {
          this.imprimir();
        }
      }]
    });
    return await alert.present();
  }

  private imprimir() {
    const documento = this.loadDocument();
    if (this.platform.is('cordova')) {
      this.printer.isAvailable().then(() => {
        const options: PrintOptions = {
          name: 'venta' + this.venta.id,
          printerId: 'printer007',
          duplex: true,
          landscape: true,
          grayscale: true
        };

        this.printer.print(documento, options).then(() => {
          this.presentToast('Se ha registrado la venta');
        }).catch(err => { return err });
      }).catch(err => this.presentAlertError(err, 'imprimir'));
    } else {
      this.presentToast('Se ha registrado la venta');
    }
  }

  private loadDocument() {
    let documento = '<div align="center">' +
      'Empresa' +
      '<br/>' +
      '<br/>' +
      'Venta No. ' + this.venta.id +
      '<br/>' +
      'Fecha: ' + this.venta.fecha.toLocaleString() +
      '<br/>' +
      '</div>' +
      '<br/>' +
      '<br/>' +
      '<table style="width:100%">' +
      '<tr>' +
      '<th>Producto</th>' +
      '<th>Cantidad</th>' +
      '<th>Precio</th>' +
      '<th>Subtotal</th>' +
      '</tr>';
    this.venta.detalle.forEach(item => {
      documento += '<tr>' +
        `<td> ${item.producto.nombre} </td>` +
        `<td align="right"> ${item.cantidad} </td>` +
        `<td align="right"> $ ${item.producto.precio} </td>` +
        `<td align="right"> $ ${item.subtotal} </td>` +
        '</tr>';
    });
    documento += '<tr>' +
      `<td colspan="4" align="right"><strong>Total: $</strong> ${this.venta.total} </td>` +
      '</tr>' +
      '<tr>' +
      `<td colspan="4" align="right"><strong>Paga: $</strong> ${this.venta.pago} </td>` +
      '</tr>' +
      '<tr>' +
      `<td colspan="4" align="right"><strong>Devuelta: $</strong> ${this.venta.devuelta} </td>` +
      '</tr>' +
      '</table>' +
      `<div style="width: 100%; text-align: center">Turno: ${this.venta.turno}</div>`;
    return documento;
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000
    });
    toast.present();

    this.navController.goBack(true);
  }

  async presentAlertError(err: any, tipo: string) {
    const alert = await this.alertController.create({
      header: 'Ha ocurrido un error',
      subHeader: `Se presentó un error al ${tipo} la venta.`,
      message: `Error: ${err}`,
      buttons: ['OK']
    });

    alert.present();
  }

}
