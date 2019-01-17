import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GrupoOptions } from '../grupo-options';
import { ModalController } from '@ionic/angular';
import { DetalleGrupoPage } from '../detalle-grupo/detalle-grupo.page';

@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.page.html',
  styleUrls: ['./grupo.page.scss'],
})
export class GrupoPage implements OnInit {

  public grupos: GrupoOptions[];

  constructor(
    private angularFirestore: AngularFirestore,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.updateGrupos();
  }

  private updateGrupos() {
    const gruposCollection = this.angularFirestore.collection<GrupoOptions>('grupos');
    gruposCollection.valueChanges().subscribe(grupos => {
      this.grupos = grupos;
    });
  }

  public ver(idgrupo: string) {
    this.presentGrupoModal(idgrupo);
  }

  private async presentGrupoModal(idgrupo: string) {
    const modal = await this.modalController.create({
      component: DetalleGrupoPage,
      componentProps: {
        idgrupo: idgrupo
      }
    });

    await modal.present();
  }

}
