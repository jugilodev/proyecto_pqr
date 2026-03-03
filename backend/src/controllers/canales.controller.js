import { pool } from '../config/db.js';

export const getCanales = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id_canal,
                c.tipo_canal
            FROM canal c 
            ORDER BY c.id_canal ASC
        `)
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo canales' });
    }
}
