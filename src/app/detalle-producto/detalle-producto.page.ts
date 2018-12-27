import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NavParams, ToastController, AlertController, ModalController } from '@ionic/angular';
import { ProductoOptions } from '../producto-options';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { GrupoOptions } from '../grupo-options';
import { MarcaPage } from '../marca/marca.page';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase';
import { finalize } from 'rxjs/operators';

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
  public marca: string;
  private filePathData: string;

  constructor(
    public navParams: NavParams,
    private af: AngularFirestore,
    private formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private camera: Camera,
    private storage: AngularFireStorage,
  ) { }

  ngOnInit() {
    this.id = this.navParams.get('idproducto');
    this.productoCollection = this.af.collection('productos');
    this.updateGrupos();
    this.updateProducto();
  }

  private updateGrupos() {
    const grupoCollection = this.af.collection<GrupoOptions>('grupos');
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
      id: [this.producto.id, Validators.required, this.valorUnico()],
      nombre: [this.producto.nombre, Validators.required],
      descripcion: [this.producto.descripcion, Validators.required],
      marca: [this.producto.marca, Validators.required],
      grupo: [this.producto.grupo, Validators.required],
      alerta: [this.producto.alerta],
      precio: [this.producto.precio, Validators.required],
      imagen: [this.producto.imagen],
      cantidad: [this.producto.cantidad || 0],
      activo: [this.producto.activo]
    });
  }

  private valorUnico(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (Validators.required(control)) return null;
      return new Observable((observer) => {
        if (!this.id) {
          const id: string = control.value;

          const productoDoc = this.productoCollection.doc(id);
          productoDoc.get().subscribe(data => {
            if (data.exists) {
              observer.next({ valorUnico: true });
            } else {
              observer.next(null);
            }
          });
        } else {
          observer.next(null);
        }

        observer.complete();
      });
    }
  }

  async marcas() {
    const modal = await this.modalCtrl.create({
      component: MarcaPage,
      componentProps: { data: true }
    });

    modal.onDidDismiss().then(select => {
      const data = select.data;
      if (data) {
        this.marca = data.marca.nombre;
        this.todo.patchValue({ 'marca': data.marca });
      }
    });

    await modal.present();
  }

  public guardar() {
    const producto: ProductoOptions = this.todo.value;
    if (this.id) {
      this.productoDoc.update({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        marca: producto.marca,
        imagen: producto.imagen,
        grupo: producto.grupo,
        precio: producto.precio,
        activo: producto.activo,
        alerta: producto.alerta
      }).then(() => {
        this.presentToast('El producto ha sido actualizado');
      }).catch(err => {
        this.presentAlertError(err, 'actualizar');
      });
    } else {
      this.productoDoc.set(producto).then(() => {
        this.presentToast('El producto ha sido registrado');
      }).catch(err => {
        this.presentAlertError(err, 'registrar');
      });;
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
      message: `Error: ${err}`
    });

    alert.present();
  }

  public currencyInputChanged(value: any) {
    var num = value.replace(/[$,]/g, "");
    return Number(num);
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
    console.log(imagen);
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
  }

}
