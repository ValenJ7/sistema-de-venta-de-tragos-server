import { Router } from "express"
import { body, param } from "express-validator"
import {
    createCategoria,
    getCategorias,
    getCategoriaById,
    updateCategoria,
    deleteCategoria
} from "../handlers/categoria"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Categoria:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  nombre:
 *                      type: string
 *                      example: "Bebidas"
 */

/**
 * @swagger
 * /api/categorias:
 *      get:
 *          summary: Obtiene todas las categorías
 *          tags:
 *              - Categorias
 *          responses:
 *              200:
 *                  description: Lista de categorías
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Categoria'
 */
router.get('/', getCategorias)

/**
 * @swagger
 * /api/categorias/{id}:
 *      get:
 *          summary: Obtiene una categoría por ID
 *          tags:
 *              - Categorias
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID de la categoría a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Categoria'
 *              404:
 *                  description: Categoría no encontrada
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getCategoriaById
)

/**
 * @swagger
 * /api/categorias/{id}:
 *      put:
 *          summary: Actualiza una categoría existente
 *          tags:
 *              - Categorias
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
 *                      example: "Bebidas Premium"
 *          responses:
 *              200:
 *                  description: Categoría actualizada
 *              404:
 *                  description: Categoría no encontrada
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    handleInputErrors,
    updateCategoria
)

/**
 * @swagger
 * /api/categorias:
 *      post:
 *          summary: Crea una nueva categoría
 *          tags:
 *              - Categorias
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                  example: "Tragos"
 *          responses:
 *              201:
 *                  description: Categoría creada
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  data:
 *                                      $ref: '#/components/schemas/Categoria'
 */
router.post('/',
    body('nombre')
        .notEmpty().withMessage('El nombre de la categoría no puede ir vacío'),
    handleInputErrors,
    createCategoria
)

/**
 * @swagger
 * /api/categorias/{id}:
 *      delete:
 *          summary: Elimina una categoría
 *          tags:
 *              - Categorias
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Categoría eliminada
 *              404:
 *                  description: Categoría no encontrada
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteCategoria
)

export default router
