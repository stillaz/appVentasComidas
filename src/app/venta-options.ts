import { ProductoOptions } from "./producto-options";
import { UsuarioOptions } from "./usuario-options";

export interface VentaOptions {
    id: number,
    turno: number,
    estado: string,
    fecha: Date,
    detalle: [{
        producto: ProductoOptions,
        cantidad: number,
        subtotal: number
    }],
    total: number,
    pago: number,
    devuelta: number,
    recibido: number,
    usuario: UsuarioOptions
}
