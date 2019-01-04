import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GrupoOptions } from '../grupo-options';
import { ProductoOptions } from '../producto-options';

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.page.html',
  styleUrls: ['./detalle-venta.page.scss'],
})
export class DetalleVentaPage implements OnInit {

  public grupos: GrupoOptions[];
  public agrupar: boolean;
  private productos: ProductoOptions[];
  public gruposProducto: any;

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.updateGrupos();
  }

  private updateGrupos() {
    const grupoCollection = this.angularFirestore.collection<GrupoOptions>('grupos');
    grupoCollection.valueChanges().subscribe(grupos => {
      this.grupos = grupos;
    });
  }

  public updateProductosGrupo(event: any) {
    const seleccionado = event.detail.value;
    let productoCollection: AngularFirestoreCollection<ProductoOptions>;
    if (seleccionado == "0") {
      productoCollection = this.angularFirestore.collection('productos');
      this.agrupar = true;
    } else {
      productoCollection = this.angularFirestore.collection('productos', ref => ref.where('grupo.id', "==", seleccionado));
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

}
