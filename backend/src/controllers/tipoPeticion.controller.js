import { pool } from '../config/db.js';

export const getTiposPeticion = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id_tipo_peticion,
        tipo_peticion,
        descripcion
      FROM tipo_peticion
      ORDER BY id_tipo_peticion ASC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo tipos de petición' });
    }
};