import { pool } from '../config/db.js';

const generarNumero = () => {
    const numero = Math.floor(Math.random() * 900000) + 100000; // Genera un número aleatorio de 6 dígitos
    return numero.toString();
}

export const generarRadicado = async () => {
    let radicado;
    let existe = true;

    while (existe) {
        radicado = generarNumero();

        const result = await pool.query(
            `SELECT 1 FROM pqr WHERE radicado = $1`,
            [radicado]
        );

        if (result.rows.length === 0) {
            existe = false;
        }
    }

    return radicado;
}
