import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {

  public monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  public dayLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  public hoy = new Date();
  public fecha: Date;
  public min: Date;
  public max: Date;

  constructor(
    public modalController: ModalController,
    public navParams: NavParams
  ) { }

  ngOnInit() {
    this.fecha = this.navParams.get('fecha') || this.hoy;
    this.max = moment(this.hoy).endOf('day').toDate();
  }

  public seleccionar(event: Date) {
    this.fecha = event;
  }

  public continuar() {
    this.modalController.dismiss({
      fecha: this.fecha
    });
  }

  public cancelar() {
    this.modalController.dismiss();
  }

}
