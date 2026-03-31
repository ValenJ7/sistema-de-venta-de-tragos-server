import { Router } from "express"
import { body, param, query } from "express-validator"
import {
    getSesionActiva,
    getCajasDisponibles,
    createSesion,
    closeSesion,
    getVentasBySesion
} from "../handlers/sesionCaja"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * /api/sesiones/activa:
 *      get:
 *          summary: Obtiene la sesión activa del usuario
 *          tags:
 *              - Sesiones de Caja
 *          parameters:
 *              - in: query
 *                name: usuario_id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Sesión activa (o null si no hay una)
 */
router.get('/activa',
    query('usuario_id').isInt().withMessage('usuario_id debe ser un entero'),
    handleInputErrors,
    getSesionActiva
)

/**
 * @swagger
 * /api/sesiones/cajas-disponibles:
 *      get:
 *          summary: Obtiene las cajas disponibles (cerradas) para abrir sesión
 *          tags:
 *              - Sesiones de Caja
 *          responses:
 *              200:
 *                  description: Lista de cajas cerradas
 */
router.get('/cajas-disponibles', getCajasDisponibles)

/**
 * @swagger
 * /api/sesiones/{sesionId}/ventas:
 *      get:
 *          summary: Obtiene todas las ventas de una sesión específica
 *          tags:
 *              - Sesiones de Caja
 *          parameters:
 *              - in: path
 *                name: sesionId
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Lista de ventas de la sesión
 */
router.get('/:sesionId/ventas',
    param('sesionId').isInt().withMessage('ID de sesión no válido'),
    handleInputErrors,
    getVentasBySesion
)

/**
 * @swagger
 * /api/sesiones:
 *      post:
 *          summary: Abre una nueva sesión de caja
 *          tags:
 *              - Sesiones de Caja
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              usuario_id:
 *                                  type: integer
 *                              caja_id:
 *                                  type: integer
 *                              monto_inicial:
 *                                  type: number
 *                      example:
 *                          usuario_id: 1
 *                          caja_id: 1
 *                          monto_inicial: 5000
 *          responses:
 *              201:
 *                  description: Sesión abierta correctamente
 *              400:
 *                  description: El usuario ya tiene una sesión abierta o la caja está en uso
 */
router.post('/',
    body('usuario_id').isInt().withMessage('usuario_id es requerido y debe ser un entero'),
    body('caja_id').isInt().withMessage('caja_id es requerido y debe ser un entero'),
    body('monto_inicial').isDecimal().withMessage('monto_inicial es requerido y debe ser un valor decimal'),
    handleInputErrors,
    createSesion
)

/**
 * @swagger
 * /api/sesiones/{id}:
 *      put:
 *          summary: Cierra una sesión de caja
 *          tags:
 *              - Sesiones de Caja
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              monto_final_real:
 *                                  type: number
 *                      example:
 *                          monto_final_real: 8500.50
 *          responses:
 *              200:
 *                  description: Sesión cerrada correctamente
 *              400:
 *                  description: La sesión ya está cerrada
 *              404:
 *                  description: Sesión no encontrada
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('monto_final_real').isDecimal().withMessage('monto_final_real es requerido y debe ser un valor decimal'),
    handleInputErrors,
    closeSesion
)

export default router
