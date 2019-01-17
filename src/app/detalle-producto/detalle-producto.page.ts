import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NavParams, ToastController, AlertController, ModalController, LoadingController } from '@ionic/angular';
import { ProductoOptions } from '../producto-options';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { GrupoOptions } from '../grupo-options';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase';
import { finalize } from 'rxjs/operators';
import { isNumber } from 'util';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
})
export class DetalleProductoPage implements OnInit {

  public todo: FormGroup;
  private producto: ProductoOptions;
  private id: string;
  private productoCollection: AngularFirestoreCollection;
  private productoDoc: AngularFirestoreDocument<ProductoOptions>;
  public grupos: GrupoOptions[];
  private filePathData: string;
  public loading: any;

  constructor(
    public navParams: NavParams,
    private af: AngularFirestore,
    private formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private camera: Camera,
    private storage: AngularFireStorage,
    public loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.id = this.navParams.get('idproducto');
    this.productoCollection = this.af.collection('productos');
    this.updateGrupos();
    this.updateProducto();
  }

  private updateGrupos() {
    const grupoCollection = this.af.collection<GrupoOptions>('grupos', ref => ref.orderBy('nombre'));
    grupoCollection.valueChanges().subscribe(grupos => {
      this.grupos = grupos;
    });
  }

  private updateProducto() {
    if (this.id) {
      this.productoDoc = this.productoCollection.doc(this.id);
      this.productoDoc.valueChanges().subscribe(producto => {
        this.producto = producto;
        this.form();
      });
    } else {
      this.producto = {} as ProductoOptions;
      this.form();
    }
  }

  private form() {
    this.todo = this.formBuilder.group({
      id: [{value: this.producto.id, disabled: this.id}, Validators.required, this.valorUnico()],
      nombre: [this.producto.nombre, Validators.required],
      descripcion: [this.producto.descripcion, Validators.required],
      grupo: [this.producto.grupo, Validators.required],
      precio: [this.producto.precio, Validators.required],
      imagen: [this.producto.imagen],
      activo: [this.producto.activo || true]
    });
  }

  private valorUnico(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (Validators.required(control)) return null;
      return new Promise(resolve => {
        if (!this.id) {
          const id: string = control.value;
          const productoDoc = this.productoCollection.doc(id);

          productoDoc.get().subscribe(data => {
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

  public guardar() {
    const precioForm = this.todo.value.precio;
    const precio = !isNumber(precioForm) ? parseInt(precioForm.replace(/[^\d]/g, "")) : precioForm;
    const producto: ProductoOptions = this.todo.value;
    producto.precio = precio;
    this.presentLoading();
    if (this.id) {
      this.productoDoc.update({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagen: producto.imagen,
        grupo: producto.grupo,
        precio: producto.precio,
        activo: producto.activo
      }).then(() => {
        this.presentToast('El producto ha sido actualizado');
        this.loading.dismiss();
      }).catch(err => {
        this.presentAlertError(err, 'actualizar');
        this.loading.dismiss();
      });
    } else {
      this.productoDoc.set(producto).then(() => {
        this.presentToast('El producto ha sido registrado');
        this.loading.dismiss();
      }).catch(err => {
        this.presentAlertError(err, 'registrar');
        this.loading.dismiss();
      });
    }
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000
    });
    toast.present();
    this.salir();
  }

  public salir() {
    this.modalCtrl.dismiss();
  }

  async presentAlertError(err: any, tipo: string) {
    const alert = await this.alertCtrl.create({
      header: 'Ha ocurrido un error',
      subHeader: `Se presentó un error al ${tipo} el producto.`,
      message: `Error: ${err}`,
      buttons: ['OK']
    });

    alert.present();
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
    };

    this.camera.getPicture(cameraOptions).then((imageData) => {
      const imagen = "data:image/jpeg;base64," + imageData;
      const fileRef = this.storage.ref(this.filePathData);
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
      const fileRef = this.storage.ref(this.filePathData);
      fileRef.putString(imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      });
    }).catch(err => alert('Upload Failed' + err));
  }

  public seleccionarImagen(event: any) {
    const imagen = event.target.files[0];
    const fileRef = this.storage.ref(this.filePathData);
    const task = this.storage.upload(this.filePathData, imagen);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      })
    ).subscribe();
  }

  public updateFilePath() {
    const id = this.todo.value.id;
    this.filePathData = id ? 'productos/' + id : null;
    this.productoDoc = this.af.doc(this.filePathData);
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Procesando...',
      spinner: 'crescent',
    });
    return await this.loading.present();
  }

  public eliminar() {
    this.presentAlertEliminar();
  }

  private async presentAlertEliminar() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar grupo',
      message: `¿Está seguro de eliminar el grupo ${this.id}?`,
      buttons: [{
        text: 'Si',
        handler: () => {
          const productoDoc = this.productoCollection.doc(this.id);
          this.presentLoading();
          productoDoc.delete().then(() => {
            this.presentToast('El producto ha sido eliminado');
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

}
