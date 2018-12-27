import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, PopoverController, ActionSheetController, AlertController } from '@ionic/angular';
import { ProductoOptions } from '../producto-options';
import { AngularFirestore } from '@angular/fire/firestore';
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

  pages: any[] = [
    { title: 'Productos en alerta', component: 'ListaProductosAlertaPage', icon: 'alert' },
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
      this.updateProductos();
    });
  }

  private updateProductos() {
    const productoCollection = this.af.collection<ProductoOptions>('productos');
    productoCollection.valueChanges().subscribe(productos => {
      this.productos = productos;
      if (productos[0]) {
        this.updateGruposProductos();
        if (this.mensaje) {
          this.updateProductosAlerta();
          this.mensaje = false;
        }
      }
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
      this.gruposProducto.push({ grupo: grupo, servicios: grupos[grupo] });
    }
  }

  async updateProductosAlerta() {
    const productosAlerta = this.productos.filter(producto => producto.alerta <= producto.cantidad).length;
    this.pages[0].badge = productosAlerta;
    const alert = await this.alertCtrl.create({
      header: 'Alerta',
      message: 'Tienes productos a punto de acabarse',
      buttons: ['OK']
    });

    await alert.present();
  }

  async ver(idproducto: string) {
    const modal = await this.modalCtrl.create({
      component: DetalleProductoPage,
      componentProps: { idproducto: idproducto }
    });
    await modal.present();
  }

  /*filtrar() {
    if (this.busqueda) {
      this.producto.getProductosFiltrado(this.busqueda, 'descripcion').then((productos) => {
        this.productos = productos;
      });
    } else {
      this.getProductos();
    }
  }

  openPage(page: any) {
    this.navCtrl.navigateForward(page.component);
  }

  /*menu(myEvent) {
    let popover = this.popoverCtrl.create('MenuProductosPage');
    popover.onDidDismiss(data => {
      this.getProductos();
    });
    popover.present({
      ev: myEvent
    });
  }*/

  async verPrecio(idproducto: string) {
    const modal = await this.modalCtrl.create({
      component: DetallePrecioProductoPage,
      componentProps: { idproducto: idproducto }
    });
    await modal.present();
  }

  /*filtrosGrupos() {
    const filtros: any = [];
    filtros.push({
      text: 'Todos los grupos', handler: () => {
        this.filtro = null;
        this.gruposeleccion = 'Todos los grupos';
        this.marcaseleccion = 'Todas las marcas';
      }
    });

    this.grupos.forEach(grupo => {
      filtros.push({
        text: grupo, handler: () => {
          this.filtro = 'grupo';
          this.producto.getProductosFiltrado(grupo, this.filtro).then((productos) => {
            this.productos = productos;
          });
          this.gruposeleccion = grupo;
          this.marcaseleccion = 'Todas las marcas';
        }
      });
    });

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Grupos',
      buttons: filtros,
      cssClass: 'actionSheet1'
    });
    actionSheet.present();
  }

  filtrosMarcas() {
    let filtros: any = [];
    filtros.push({
      text: 'Todas las marcas', handler: () => {
        this.getProductos();
        this.filtro = null;
        this.marcaseleccion = 'Todas las marcas';
        this.gruposeleccion = 'Todos los grupos';
      }
    });

    this.producto.getMarcas().then(marcas => {
      for (let marca of marcas) {
        filtros.push({
          text: marca, handler: () => {
            this.filtro = 'marca';
            this.producto.getProductosFiltrado(marca, this.filtro).then((productos) => {
              this.productos = productos;
            });
            this.marcaseleccion = marca;
            this.gruposeleccion = 'Todos los grupos';
          }
        });
      }
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Marcas',
        buttons: filtros
      });
      actionSheet.present();
    });
  }

  irAlertas() {
    this.navCtrl.push('ListaProductosAlertaPage');
  }*/

}
