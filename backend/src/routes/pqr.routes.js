import { Router } from 'express';
import { getPqrs, createPqr } from '../controllers/pqr.controller.js';

const router = Router();

router.get('/', getPqrs);
router.post('/', createPqr);

export default router;