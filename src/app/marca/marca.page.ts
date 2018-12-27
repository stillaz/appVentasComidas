import { Component, OnInit } from '@angular/core';
import { MarcaOptions } from '../marca-options';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController, NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-marca',
  templateUrl: './marca.page.html',
  styleUrls: ['./marca.page.scss'],
})
export class MarcaPage implements OnInit {

  public marcas: MarcaOptions[];
  public info: boolean;

  constructor(
    public angularFirestore: AngularFirestore,
    public modalCtrl: ModalController,
    public navParams: NavParams
  ) { }

  ngOnInit() {
    this.info = this.navParams.get('data');
    this.updateMarcas();
  }

  private updateMarcas() {
    const marcasCollection = this.angularFirestore.collection<MarcaOptions>('marcas');
    marcasCollection.valueChanges().subscribe(marcas => {
      this.marcas = marcas;
    });
  }

  public ver(marca: MarcaOptions) {
    if (this.info) {
      this.modalCtrl.dismiss({
        marca: marca
      });
    } else {
      
    }
  }


}
