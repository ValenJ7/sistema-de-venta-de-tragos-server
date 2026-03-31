import { Router } from "express"
import { body, param } from "express-validator"
import {
    getVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta
} from "../handlers/venta"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Venta:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  sesion_id:
 *                      type: integer
 *                      example: 1
 *                  total:
 *                      type: number
 *                      format: float
 *                      example: 15000.50
 *                  metodo_pago:
 *                      type: string
 *                      example: "Efectivo"
 *                  fecha:
 *                      type: string
 *                      format: date-time
 */

/**
 * @swagger
 * /api/ventas:
 *      get:
 *          summary: Obtiene todas las ventas
 *          tags:
 *              - Ventas
 *          responses:
 *              200:
 *                  description: Lista de ventas
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Venta'
 */
router.get('/', getVentas)

/**
 * @swagger
 * /api/ventas/{id}:
 *      get:
 *          summary: Obtiene una venta por ID
 *          tags:
 *              - Ventas
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID de la venta a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Venta'
 *              404:
 *                  description: Venta no encontrada
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getVentaById
)

/**
 * @swagger
 * /api/ventas:
 *      post:
 *          summary: Crea una nueva venta
 *          tags:
 *              - Ventas
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              sesion_id:
 *                                  type: integer
 *                              total:
 *                                  type: number
 *                              metodo_pago:
 *                                  type: string
 *                      example:
 *                          sesion_id: 1
 *                          total: 5000.00
 *                          metodo_pago: "QR"
 *          responses:
 *              201:
 *                  description: Venta creada
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Venta'
 */
router.post('/',
    body('sesion_id').isInt().withMessage('Sesión no válida'),
    body('total').isFloat({ min: 0 }).withMessage('El total debe ser un número positivo'),
    body('metodo_pago').notEmpty().withMessage('El método de pago no puede ir vacío'),
    body('detalles').isArray({ min: 1 }).withMessage('La venta debe tener al menos un producto'),
    body('detalles.*.producto_id').isInt({ min: 1 }).withMessage('producto_id inválido'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
    body('detalles.*.precio_unitario').isFloat({ min: 0 }).withMessage('El precio unitario debe ser positivo'),
    body('detalles.*.subtotal').isFloat({ min: 0 }).withMessage('El subtotal debe ser positivo'),
    handleInputErrors,
    createVenta
)

/**
 * @swagger
 * /api/ventas/{id}:
 *      put:
 *          summary: Actualiza una venta existente
 *          tags:
 *              - Ventas
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
 *                              sesion_id:
 *                                  type: integer
 *                              total:
 *                                  type: number
 *                              metodo_pago:
 *                                  type: string
 *                      example:
 *                          sesion_id: 1
 *                          total: 5500.00
 *                          metodo_pago: "Tarjeta"
 *          responses:
 *              200:
 *                  description: Venta actualizada
 *              404:
 *                  description: Venta no encontrada
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('sesion_id').isInt().withMessage('Sesión no válida'),
    body('total').isNumeric().withMessage('El total debe ser un número'),
    body('metodo_pago').notEmpty().withMessage('El método de pago no puede ir vacío'),
    handleInputErrors,
    updateVenta
)

/**
 * @swagger
 * /api/ventas/{id}:
 *      delete:
 *          summary: Elimina una venta
 *          tags:
 *              - Ventas
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Venta eliminada
 *              404:
 *                  description: Venta no encontrada
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteVenta
)

export default router
