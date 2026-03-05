import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

export const createUsuarios = async (req, res) => {

    const { nombre, correo, password, rol, area } = req.body;

    try {

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            `
      INSERT INTO usuarios (
        nombre,
        correo,
        password_hash,
        rol,
        area,
        activo
      )
      VALUES ($1,$2,$3,$4,$5,true)
      RETURNING id_usuario,nombre,correo,rol,area
      `,
            [nombre, correo, password_hash, rol, area]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Error creando usuario" });

    }

};


export const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_usuario, nombre, correo, rol, area FROM usuarios`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo usuarios" });
    }
}