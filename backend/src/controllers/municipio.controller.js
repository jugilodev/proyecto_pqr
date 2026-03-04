import { pool } from '../config/db.js'

export const getMunicipios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.id_municipio,
                m.nombre
            FROM municipio m 
            ORDER BY m.id_municipio ASC
        `)
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obteniendo municipios' });
    }
}

