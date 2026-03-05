import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};