import { ProductoOptions } from "./producto-options";

export interface VentaOptions {
    id: number,
    turno: number,
    estado: string,
    detalle: [{
        producto: ProductoOptions,
        cantidad: number,
        subtotal: number
    }],
    total: number,
    pago: number,
    devuelve: number
}
