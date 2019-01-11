import { Injectable } from '@angular/core';
import { UsuarioOptions } from './usuario-options';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuario: UsuarioOptions;

  constructor() { }

  setUsuario(usuario: UsuarioOptions) {
    this.usuario = usuario;
  }

  getUsuario() {
    return this.usuario;
  }

  isAdministrador() {
    return this.usuario ? this.usuario.perfiles.some(perfil => perfil.nombre === 'Administrador') : false;
  }

  getFilePathUsuario() {
    return `/usuarios/${this.usuario.id}`;
  }
}
