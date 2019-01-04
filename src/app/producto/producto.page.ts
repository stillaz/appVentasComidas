import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, PopoverController, ActionSheetController, AlertController } from '@ionic/angular';
import { ProductoOptions } from '../producto-options';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { DetalleProductoPage } from '../detalle-producto/detalle-producto.page';
import { DetallePrecioProductoPage } from '../detalle-precio-producto/detalle-precio-producto.page';
import { GrupoOptions } from '../grupo-options';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {

  public busqueda: string = '';
  public gruposProducto: any[];
  public modo = 'dos';
  public filtro: string;
  public gruposeleccion: string;
  public marcaseleccion: string;
  public mensaje = true;
  public productos: ProductoOptions[];
  public grupos: GrupoOptions[];
  public agrupar: boolean;

  pages: any[] = [
    { title: 'Productos más vendidos', component: '', icon: 'trending-up' },
    { title: 'Productos menos vendidos', component: '', icon: 'trending-down' },
    { title: 'Histórico inventario', component: '', icon: 'list-box' }
  ];

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public actionSheetCtrl: ActionSheetController,
    private af: AngularFirestore,
    public alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.gruposeleccion = 'Todos los grupos';
    this.marcaseleccion = 'Todas las marcas';
    this.updateGrupos();
  }

  private updateGrupos() {
    const grupoCollection = this.af.collection<GrupoOptions>('grupos');
    grupoCollection.valueChanges().subscribe(grupos => {
      this.grupos = grupos;
    });
  }

  public updateProductosGrupo(event: any) {
    const seleccionado = event.detail.value;
    let productoCollection: AngularFirestoreCollection<ProductoOptions>;
    if (seleccionado == "0") {
      productoCollection = this.af.collection('productos');
      this.agrupar = true;
    } else {
      productoCollection = this.af.collection('productos', ref => ref.where('grupo.id', "==", seleccionado));
      this.agrupar = false;
    }

    this.updateProductos(productoCollection);
  }

  private updateProductos(productoCollection: AngularFirestoreCollection<ProductoOptions>) {
    productoCollection.valueChanges().subscribe(productos => {
      this.productos = productos;
      this.updateGruposProductos();
    });
  }

  private updateGruposProductos() {
    const grupos = [];
    this.gruposProducto = [];
    this.productos.forEach(producto => {
      const grupo = producto.grupo;
      if (grupos[grupo.id] === undefined) {
        grupos[grupo.id] = [];
      }
      grupos[grupo.id].push(producto);
    });

    for (let grupo in grupos) {
      const dataGrupo = this.grupos.find(todos => todos.id === grupo);
      this.gruposProducto.push({ grupo: dataGrupo, productos: grupos[grupo] });
    }
  }

  async ver(idproducto: string) {
    const modal = await this.modalCtrl.create({
      component: DetalleProductoPage,
      componentProps: { idproducto: idproducto }
    });
    await modal.present();
  }

  openPage(page: any) {
    this.navCtrl.navigateForward(page.component);
  }

  async verPrecio(idproducto: string) {
    const modal = await this.modalCtrl.create({
      component: DetallePrecioProductoPage,
      componentProps: { idproducto: idproducto }
    });
    await modal.present();
  }

}
