import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

  constructor(private navController: NavController) { }

  ngOnInit() {
  }

  public ir(page: string) {
    this.navController.navigateForward(`tabs/configuracion/${page}`);
  }

}
