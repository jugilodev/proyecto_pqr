import { Router } from 'express';
import { getTiposPeticion } from '../controllers/tipoPeticion.controller.js';

const router = Router();

router.get('/', getTiposPeticion);

export default router;