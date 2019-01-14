import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {

  public monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  public dayLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  public hoy = new Date();
  public fecha = this.hoy;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
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
