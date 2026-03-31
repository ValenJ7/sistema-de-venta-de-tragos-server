import { Router } from "express"
import { body, param } from "express-validator"
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} from "../handlers/producto"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Producto:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  nombre:
 *                      type: string
 *                      example: "Fernet Branca 750ml"
 *                  precio:
 *                      type: number
 *                      format: float
 *                      example: 12500.50
 *                  categoria_id:
 *                      type: integer
 *                      example: 1
 *                  categoria:
 *                      $ref: '#/components/schemas/Categoria'
 */

/**
 * @swagger
 * /api/productos:
 *      get:
 *          summary: Obtiene todos los productos
 *          tags:
 *              - Productos
 *          responses:
 *              200:
 *                  description: Lista de productos
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Producto'
 */
router.get('/', getProductos)

/**
 * @swagger
 * /api/productos/{id}:
 *      get:
 *          summary: Obtiene un producto por ID
 *          tags:
 *              - Productos
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID del producto a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Producto'
 *              404:
 *                  description: Producto no encontrado
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getProductoById
)

/**
 * @swagger
 * /api/productos:
 *      post:
 *          summary: Crea un nuevo producto
 *          tags:
 *              - Productos
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                              precio:
 *                                  type: number
 *                              categoria_id:
 *                                  type: integer
 *                      example:
 *                          nombre: "Gin Tonic"
 *                          precio: 4500.00
 *                          categoria_id: 1
 *          responses:
 *              201:
 *                  description: Producto creado
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Producto'
 */
router.post('/',
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('precio')
        .isNumeric().withMessage('El precio debe ser un número')
        .custom(value => value > 0).withMessage('El precio debe ser mayor a 0'),
    body('categoria_id')
        .isInt().withMessage('La categoría no es válida'),
    handleInputErrors,
    createProducto
)

/**
 * @swagger
 * /api/productos/{id}:
 *      put:
 *          summary: Actualiza un producto existente
 *          tags:
 *              - Productos
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
 *                              precio:
 *                                  type: number
 *                              categoria_id:
 *                                  type: integer
 *                      example:
 *                          nombre: "Gin Tonic Premium"
 *                          precio: 5000.00
 *                          categoria_id: 1
 *          responses:
 *              200:
 *                  description: Producto actualizado
 *              404:
 *                  description: Producto no encontrado
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('precio')
        .isNumeric().withMessage('El precio debe ser un número')
        .custom(value => value > 0).withMessage('El precio debe ser mayor a 0'),
    body('categoria_id')
        .isInt().withMessage('La categoría no es válida'),
    handleInputErrors,
    updateProducto
)

/**
 * @swagger
 * /api/productos/{id}:
 *      delete:
 *          summary: Elimina un producto
 *          tags:
 *              - Productos
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Producto eliminado
 *              404:
 *                  description: Producto no encontrado
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteProducto
)

export default router
