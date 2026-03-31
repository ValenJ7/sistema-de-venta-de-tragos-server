import { Router } from "express"
import { body, param } from "express-validator"
import {
    getCajas,
    getCajaById,
    createCaja,
    updateCaja,
    deleteCaja
} from "../handlers/caja"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Caja:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  nombre:
 *                      type: string
 *                      example: "Barra Principal"
 *                  estado:
 *                      type: string
 *                      enum: [ABIERTA, CERRADA]
 *                      example: "CERRADA"
 *                  negocio_id:
 *                      type: integer
 *                      example: 1
 */

/**
 * @swagger
 * /api/cajas:
 *      get:
 *          summary: Obtiene todas las cajas
 *          tags:
 *              - Cajas
 *          responses:
 *              200:
 *                  description: Lista de cajas
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Caja'
 */
router.get('/', getCajas)

/**
 * @swagger
 * /api/cajas/{id}:
 *      get:
 *          summary: Obtiene una caja por ID
 *          tags:
 *              - Cajas
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID de la caja a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Caja'
 *              404:
 *                  description: Caja no encontrada
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getCajaById
)

/**
 * @swagger
 * /api/cajas:
 *      post:
 *          summary: Crea una nueva caja
 *          tags:
 *              - Cajas
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                              negocio_id:
 *                                  type: integer
 *                      example:
 *                          nombre: "VIP"
 *                          negocio_id: 1
 *          responses:
 *              201:
 *                  description: Caja creada
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Caja'
 */
router.post('/',
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    handleInputErrors,
    createCaja
)

/**
 * @swagger
 * /api/cajas/{id}:
 *      put:
 *          summary: Actualiza una caja existente
 *          tags:
 *              - Cajas
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          requestBody:
 *              required: true
 *              content:
 *                   application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                              estado:
 *                                  type: string
 *                                  enum: [ABIERTA, CERRADA]
 *                              negocio_id:
 *                                  type: integer
 *                      example:
 *                          nombre: "VIP Barra"
 *                          estado: "ABIERTA"
 *                          negocio_id: 1
 *          responses:
 *              200:
 *                  description: Caja actualizada
 *              404:
 *                  description: Caja no encontrada
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('estado').optional().isIn(['ABIERTA', 'CERRADA']).withMessage('Estado no válido'),
    handleInputErrors,
    updateCaja
)

/**
 * @swagger
 * /api/cajas/{id}:
 *      delete:
 *          summary: Elimina una caja
 *          tags:
 *              - Cajas
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Caja eliminada
 *              404:
 *                  description: Caja no encontrada
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteCaja
)

export default router
