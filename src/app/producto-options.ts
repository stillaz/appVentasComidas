import { GrupoOptions } from "./grupo-options";
import { MarcaOptions } from "./marca-options";

export interface ProductoOptions {
    id: string,
    nombre: string,
    descripcion: string,
    marca: MarcaOptions,
    grupo: GrupoOptions,
    cantidad: number,
    alerta: number,
    precio: number,
    imagen: string,
    activo: boolean
}
