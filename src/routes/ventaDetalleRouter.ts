import { Router } from "express"
import { body, param } from "express-validator"
import {
    getVentaDetalles,
    getVentaDetalleById,
    createVentaDetalle,
    updateVentaDetalle,
    deleteVentaDetalle
} from "../handlers/ventaDetalle"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          VentaDetalle:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  venta_id:
 *                      type: integer
 *                      example: 1
 *                  producto_id:
 *                      type: integer
 *                      example: 2
 *                  cantidad:
 *                      type: integer
 *                      example: 3
 *                  precio_unitario:
 *                      type: number
 *                      format: float
 *                      example: 4500.00
 *                  subtotal:
 *                      type: number
 *                      format: float
 *                      example: 13500.00
 */

/**
 * @swagger
 * /api/venta-detalles:
 *      get:
 *          summary: Obtiene todos los detalles de venta
 *          tags:
 *              - Detalles de Venta
 *          responses:
 *              200:
 *                  description: Lista de detalles
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/VentaDetalle'
 */
router.get('/', getVentaDetalles)

/**
 * @swagger
 * /api/venta-detalles/{id}:
 *      get:
 *          summary: Obtiene un detalle de venta por ID
 *          tags:
 *              - Detalles de Venta
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID del detalle a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/VentaDetalle'
 *              404:
 *                  description: Detalle no encontrado
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getVentaDetalleById
)

/**
 * @swagger
 * /api/venta-detalles:
 *      post:
 *          summary: Crea un nuevo detalle de venta
 *          tags:
 *              - Detalles de Venta
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              venta_id:
 *                                  type: integer
 *                              producto_id:
 *                                  type: integer
 *                              cantidad:
 *                                  type: integer
 *                              precio_unitario:
 *                                  type: number
 *                              subtotal:
 *                                  type: number
 *                      example:
 *                          venta_id: 1
 *                          producto_id: 2
 *                          cantidad: 2
 *                          precio_unitario: 5000.00
 *                          subtotal: 10000.00
 *          responses:
 *              201:
 *                  description: Detalle creado
 */
router.post('/',
    body('venta_id').isInt().withMessage('Venta no válida'),
    body('producto_id').isInt().withMessage('Producto no válido'),
    body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    body('precio_unitario').isNumeric().withMessage('El precio unitario debe ser un número'),
    body('subtotal').isNumeric().withMessage('El subtotal debe ser un número'),
    handleInputErrors,
    createVentaDetalle
)

/**
 * @swagger
 * /api/venta-detalles/{id}:
 *      put:
 *          summary: Actualiza un detalle de venta existente
 *          tags:
 *              - Detalles de Venta
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
 *                              venta_id:
 *                                  type: integer
 *                              producto_id:
 *                                  type: integer
 *                              cantidad:
 *                                  type: integer
 *                              precio_unitario:
 *                                  type: number
 *                              subtotal:
 *                                  type: number
 *          responses:
 *              200:
 *                  description: Detalle actualizado
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('venta_id').isInt().withMessage('Venta no válida'),
    body('producto_id').isInt().withMessage('Producto no válido'),
    body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    body('precio_unitario').isNumeric().withMessage('El precio unitario debe ser un número'),
    body('subtotal').isNumeric().withMessage('El subtotal debe ser un número'),
    handleInputErrors,
    updateVentaDetalle
)

/**
 * @swagger
 * /api/venta-detalles/{id}:
 *      delete:
 *          summary: Elimina un detalle de venta
 *          tags:
 *              - Detalles de Venta
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Detalle eliminado
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteVentaDetalle
)

export default router
