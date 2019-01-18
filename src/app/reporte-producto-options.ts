import { ProductoOptions } from "./producto-options";

export interface ReporteProductoOptions {
    detalle: [{
        producto: ProductoOptions,
        cantidad: number
    }],
    mayor: {
        producto: ProductoOptions,
        cantidad: number
    },
    menor: {
        producto: ProductoOptions,
        cantidad: number
    }
}
