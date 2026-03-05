import { pool } from '../config/db.js'
import { generarRadicado } from '../utils/radicado.js';


export const createPqr = async (req, res) => {

    const {
        nombre,
        apellido,
        direccion,
        correo,
        celular,
        id_tipo_peticion,
        fecha_evento,
        descripcion,
        id_canal,
        autorizacion_datos,
        id_municipio
    } = req.body;

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        let id_cliente;

        const clienteExiste = await client.query(
            `SELECT id_cliente FROM cliente WHERE correo = $1`,
            [correo]
        );

        if (clienteExiste.rows.length > 0) {

            id_cliente = clienteExiste.rows[0].id_cliente;

        } else {

            const nuevoCliente = await client.query(
                `
                INSERT INTO cliente (nombre, apellido, direccion, correo, celular)
                VALUES ($1,$2,$3,$4,$5)
                RETURNING id_cliente
                `,
                [nombre, apellido, direccion, correo, celular]
            );

            id_cliente = nuevoCliente.rows[0].id_cliente;
        }

        const radicado = generarRadicado();

        const nuevaPqr = await client.query(
            `
            INSERT INTO pqr
            (
                radicado,
                id_estado,
                id_tipo_peticion,
                id_canal,
                id_cliente,
                fecha_reporte,
                fecha_evento,
                descripcion,
                acepta_terminos,
                id_municipio
            )
            VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,$8,$9)
            RETURNING *
            `,
            [
                radicado,
                1,
                id_tipo_peticion,
                id_canal,
                id_cliente,
                fecha_evento,
                descripcion,
                autorizacion_datos,
                id_municipio
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: "PQR creada correctamente",
            radicado: nuevaPqr.rows[0].radicado
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error(error);

        res.status(500).json({
            message: 'Error creando PQR'
        });

    } finally {

        client.release();

    }
};