import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { VentaOptions } from '../venta-options';

@Component({
  selector: 'app-detalle-reporte-venta',
  templateUrl: './detalle-reporte-venta.page.html',
  styleUrls: ['./detalle-reporte-venta.page.scss'],
})
export class DetalleReporteVentaPage implements OnInit {

  public id: string;
  public fecha: string;
  public venta: VentaOptions;

  constructor(
    private navParams: NavParams,
    private angularFirestore: AngularFirestore,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.id = this.navParams.get('idventa');
    this.fecha = this.navParams.get('fecha');
    this.updateVenta();
  }

  updateVenta() {
    const ventaDoc = this.angularFirestore.doc<VentaOptions>(`ventas/${this.fecha}/ventas/${this.id}`);
    ventaDoc.valueChanges().subscribe(venta => {
      this.venta = venta;
    });
  }

  public salir() {
    this.modalController.dismiss();
  }

}
