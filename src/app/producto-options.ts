import { GrupoOptions } from "./grupo-options";

export interface ProductoOptions {
    id: string,
    nombre: string,
    descripcion: string,
    grupo: GrupoOptions,
    precio: number,
    imagen: string,
    activo: boolean
}
