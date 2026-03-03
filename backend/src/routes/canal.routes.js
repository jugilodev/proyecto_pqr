import { Router } from 'express';
import { getCanales } from '../controllers/canales.controller.js';

const router = Router();

router.get('/', getCanales);

export default router;