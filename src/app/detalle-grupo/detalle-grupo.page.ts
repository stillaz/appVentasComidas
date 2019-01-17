import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NavParams, Platform, ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GrupoOptions } from '../grupo-options';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-grupo',
  templateUrl: './detalle-grupo.page.html',
  styleUrls: ['./detalle-grupo.page.scss'],
})
export class DetalleGrupoPage implements OnInit {

  public todo: FormGroup;
  public id: string;
  public grupo: GrupoOptions;
  public mobile: boolean;
  public filePathImage: string;
  private grupoCollection: AngularFirestoreCollection<GrupoOptions>;
  public loading: any;

  constructor(
    public navParams: NavParams,
    public angularFirestore: AngularFirestore,
    public platform: Platform,
    private formBuilder: FormBuilder,
    private camera: Camera,
    private storage: AngularFireStorage,
    public modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.mobile = this.platform.is('cordova');
    this.id = this.navParams.get('idgrupo');
    this.grupoCollection = this.angularFirestore.collection('grupos');
    if (this.id) {
      this.updateGrupo();
    } else {
      this.grupo = {} as GrupoOptions;
      this.form();
    }
  }

  private updateGrupo() {
    const grupoDoc = this.grupoCollection.doc<GrupoOptions>(this.id);
    grupoDoc.valueChanges().subscribe(grupo => {
      this.grupo = grupo;
      this.form();
    });
  }

  private form() {
    this.todo = this.formBuilder.group({
      nombre: [{ value: this.grupo.nombre, disabled: this.id }, Validators.required, this.valorUnico()],
      imagen: [this.grupo.imagen]
    });
  }

  private valorUnico(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (Validators.required(control)) return null;
      return new Promise(resolve => {
        if (!this.id) {
          const id: string = control.value;
          const grupoDoc = this.grupoCollection.doc(id);

          grupoDoc.get().subscribe(data => {
            if (data.exists) {
              resolve({ valorUnico: true });
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    }
  }

  public sacarFoto() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 1000,
      targetHeight: 1000,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      const imagen = "data:image/jpeg;base64," + imageData;
      const fileRef = this.storage.ref(this.filePathImage);
      fileRef.putString(imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      });
    }).catch(err => alert('Upload Failed' + err));
  }

  public cargarImagen() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      const imagen = "data:image/jpeg;base64," + imageData;
      const fileRef = this.storage.ref(this.filePathImage);
      fileRef.putString(imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      });
    }).catch(err => alert('Upload Failed' + err));
  }

  public seleccionarImagen(event: any) {
    const imagen = event.target.files[0];
    const fileRef = this.storage.ref(this.filePathImage);
    const task = this.storage.upload(this.filePathImage, imagen);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      })
    ).subscribe();
  }

  public updateFilePath() {
    const id = this.todo.value.nombre;
    this.filePathImage = id ? 'grupos/' + id : null;
  }

  public cerrar() {
    this.modalController.dismiss();
  }

  public guardar() {
    const grupo = this.todo.value;
    grupo.id = grupo.nombre;
    const grupoDoc = this.grupoCollection.doc(grupo.id);
    this.presentLoading();
    grupoDoc.set(grupo).then(() => {
      this.presentToast('El grupo ha sido registrado');
      this.loading.dismiss();
    }).catch(err => {
      this.presentAlertError(err, 'registrar');
      this.loading.dismiss();
    });
  }

  public eliminar() {
    this.presentAlertEliminar();
  }

  private async presentAlertEliminar() {
    const alert = await this.alertController.create({
      header: 'Eliminar grupo',
      message: `¿Está seguro de eliminar el grupo ${this.id}?`,
      buttons: [{
        text: 'Si',
        handler: () => {
          const grupoDoc = this.grupoCollection.doc(this.id);
          this.presentLoading();
          grupoDoc.delete().then(() => {
            this.presentToast('El grupo ha sido eliminado');
            this.loading.dismiss();
          }).catch(err => {
            this.presentAlertError(err, 'eliminar');
            this.loading.dismiss();
          });
        }
      }, {
        text: 'No',
        role: 'cancel'
      }]
    });

    await alert.present();
  }

  private async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000
    });
    toast.present();
    this.cerrar();
  }

  private async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Procesando...',
      spinner: 'crescent',
    });
    return await this.loading.present();
  }

  async presentAlertError(err: any, tipo: string) {
    const alert = await this.alertController.create({
      header: 'Ha ocurrido un error',
      subHeader: `Se presentó un error al ${tipo} el producto.`,
      message: `Error: ${err}`,
      buttons: ['OK']
    });

    alert.present();
  }

}
