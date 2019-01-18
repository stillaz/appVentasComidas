import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.page.html',
  styleUrls: ['./venta.page.scss'],
})
export class VentaPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  public ir(pagina: string) {
    this.navCtrl.navigateForward(`/tabs/venta/${pagina}`);
  }

}
