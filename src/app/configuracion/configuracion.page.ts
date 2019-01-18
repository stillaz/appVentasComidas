import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

  constructor(
    private navController: NavController,
    private angularFireAuth: AngularFireAuth
  ) { }

  ngOnInit() {
  }

  public ir(page: string) {
    this.navController.navigateForward(`tabs/configuracion/${page}`);
  }

  public salir() {
    this.angularFireAuth.auth.signOut();
  }

}
