import { Router } from 'express';
import { getUsuarios, createUsuarios } from '../controllers/usuarios.controller.js';

const router = Router();

// router.get('/', getUsuarios);
router.post('/', createUsuarios);
router.get('/', getUsuarios);

export default router;