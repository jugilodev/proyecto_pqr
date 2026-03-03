import { pool } from '../config/db.js';

const generarRadicado = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getPqrs = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        p.id_pqr,
        p.radicado,
        p.fecha_reporte,
        p.fecha_evento,
        e.tipo_estado,
        tp.tipo_peticion,
        c.nombre,
        c.apellido
      FROM pqr p
      JOIN estados e ON p.id_estado = e.id_estado
      JOIN tipo_peticion tp ON p.id_tipo_peticion = tp.id_tipo_peticion
      JOIN cliente c ON p.id_cliente = c.id_cliente
      ORDER BY p.id_pqr DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo PQRs' });
    }
};


export const createPqr = async (req, res) => {
    const {
        id_tipo_peticion,
        id_canal,
        id_cliente,
        fecha_evento,
        descripcion,
        acepta_terminos
    } = req.body;

    try {
        const radicado = generarRadicado();

        const result = await pool.query(
            `
      INSERT INTO pqr (
        radicado,
        id_estado,
        id_tipo_peticion,
        id_canal,
        id_cliente,
        fecha_reporte,
        fecha_evento,
        descripcion,
        acepta_terminos
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)
      RETURNING *
      `,
            [
                radicado,
                1, // estado inicial (Revisión)
                id_tipo_peticion,
                id_canal,
                id_cliente,
                fecha_evento,
                descripcion,
                acepta_terminos
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creando PQR' });
    }
};