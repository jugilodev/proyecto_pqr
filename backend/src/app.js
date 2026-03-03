import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

