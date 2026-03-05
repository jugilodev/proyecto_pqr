import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { correo, password } = req.body;

    try {

        const result = await pool.query(
            `SELECT * FROM usuarios WHERE correo = $1`,
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        const passwordValida = await bcrypt.compare(password, user.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id_usuario: user.id_usuario, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.json({
            message: 'Login exitoso',
            usuario: {
                id: user.id_usuario,
                nombre: user.nombre,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en login' });
    }
};


export const logout = (req, res) => {

    res.clearCookie('token');

    res.json({
        message: 'Sesión cerrada'
    });

};