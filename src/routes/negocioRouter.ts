import { Router } from "express"
import { body, param } from "express-validator"
import {
    getNegocios,
    getNegocioById,
    createNegocio,
    updateNegocio,
    deleteNegocio,
    suspenderNegocio,
    activarNegocio
} from "../handlers/negocio"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Negocio:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  nombre:
 *                      type: string
 *                      example: "Mi Negocio de Tragos"
 *                  config_moneda:
 *                      type: string
 *                      example: "ARS"
 */

/**
 * @swagger
 * /api/negocios:
 *      get:
 *          summary: Obtiene todos los negocios
 *          tags:
 *              - Negocios
 *          responses:
 *              200:
 *                  description: Lista de negocios
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Negocio'
 */
router.get('/', getNegocios)

/**
 * @swagger
 * /api/negocios/{id}:
 *      get:
 *          summary: Obtiene un negocio por ID
 *          tags:
 *              - Negocios
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID del negocio a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Negocio'
 *              404:
 *                  description: Negocio no encontrado
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getNegocioById
)

/**
 * @swagger
 * /api/negocios:
 *      post:
 *          summary: Crea un nuevo negocio
 *          tags:
 *              - Negocios
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                              config_moneda:
 *                                  type: string
 *                      example:
 *                          nombre: "Bar Central"
 *                          config_moneda: "USD"
 *          responses:
 *              201:
 *                  description: Negocio creado
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Negocio'
 */
router.post('/',
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    handleInputErrors,
    createNegocio
)

/**
 * @swagger
 * /api/negocios/{id}:
 *      put:
 *          summary: Actualiza un negocio existente
 *          tags:
 *              - Negocios
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
 *                              config_moneda:
 *                                  type: string
 *                      example:
 *                          nombre: "Bar Central Renovado"
 *                          config_moneda: "ARS"
 *          responses:
 *              200:
 *                  description: Negocio actualizado
 *              404:
 *                  description: Negocio no encontrado
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    handleInputErrors,
    updateNegocio
)

/**
 * @swagger
 * /api/negocios/{id}:
 *      delete:
 *          summary: Elimina un negocio
 *          tags:
 *              - Negocios
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Negocio eliminado
 *              404:
 *                  description: Negocio no encontrado
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteNegocio
)

router.patch('/:id/suspender',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    suspenderNegocio
)

router.patch('/:id/activar',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    activarNegocio
)

export default router
