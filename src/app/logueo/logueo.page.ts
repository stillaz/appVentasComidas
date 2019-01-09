import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-logueo',
  templateUrl: './logueo.page.html',
  styleUrls: ['./logueo.page.scss'],
})
export class LogueoPage implements OnInit {

  public login = {} as {
    username: string,
    password: string
  };

  public todo: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private angularFireAuth: AngularFireAuth,
    public alertController: AlertController
  ) { }

  ngOnInit() {
    this.form();
  }

  form() {
    this.todo = this.formBuilder.group({
      username: [this.login.username, Validators.compose([Validators.required, Validators.email])],
      password: [this.login.password, Validators.required]
    });
  }

  async logueo() {
    this.login = this.todo.value;
    let result = this.angularFireAuth.auth.signInWithEmailAndPassword(this.login.username, this.login.password);
    result.catch(e => {
      this.presentAlertError(e);
    });
  }

  async presentAlertError(err: any) {
    const alert = await this.alertController.create({
      header: 'Ha ocurrido un error',
      subHeader: `Se presentó un error al loguearse en el sistema.`,
      message: `${err}`,
      buttons: ['OK']
    });

    alert.present();
  }

}
