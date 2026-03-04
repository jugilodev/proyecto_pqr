import { Router } from 'express'
import { getMunicipios } from '../controllers/municipio.controller.js'

const router = Router()

router.get('/', getMunicipios)

export default router