import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import cookieParser from 'cookie-parser';

// Importar rutas
import pqrRoutes from './routes/pqr.routes.js';
import tipoPeticionRoutes from './routes/tipoPeticion.routes.js';
import canalRoutes from './routes/canal.routes.js';
import municipioRoutes from './routes/municipio.routes.js';
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';




dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


async function connectToDatabase() {
    try {
        const client = await pool.connect();
        console.log('Connected to the database successfully');
        client.release();
    } catch (err) {
        console.error('Error connecting to the database', err);
        process.exit(1);
    }
}

connectToDatabase();

//RUTAS
app.use('/api/pqrs', pqrRoutes);
app.use('/api/tipo-peticion', tipoPeticionRoutes);
app.use('/api/canales', canalRoutes);
app.use('/api/municipios', municipioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the PQR API');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

