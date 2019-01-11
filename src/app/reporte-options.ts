import { UsuarioOptions } from "./usuario-options";

export interface ReporteOptions {
    detalle: [{
        usuario: UsuarioOptions,
        total: number,
        cantidad: number
    }],
    total: number,
    cantidad: number
}
