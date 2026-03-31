import { Router } from "express"
import { body, param } from "express-validator"
import {
    getRoles,
    createRol,
    updateRol,
    deleteRol
} from "../handlers/rol"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Rol:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  nombre:
 *                      type: string
 *                      example: "Administrador"
 */

/**
 * @swagger
 * /api/roles:
 *      get:
 *          summary: Obtiene todos los roles
 *          tags:
 *              - Roles
 *          responses:
 *              200:
 *                  description: Lista de roles
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Rol'
 */
router.get('/', getRoles)

/**
 * @swagger
 * /api/roles:
 *      post:
 *          summary: Crea un nuevo rol
 *          tags:
 *              - Roles
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                      example:
 *                          nombre: "Seguridad"
 *          responses:
 *              201:
 *                  description: Rol creado
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Rol'
 */
router.post('/',
    body('nombre').notEmpty().withMessage('El nombre del rol no puede ir vacío'),
    handleInputErrors,
    createRol
)

/**
 * @swagger
 * /api/roles/{id}:
 *      put:
 *          summary: Actualiza un rol existente
 *          tags:
 *              - Roles
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
 *                      example:
 *                          nombre: "Administrador Senior"
 *          responses:
 *              200:
 *                  description: Rol actualizado
 *              404:
 *                  description: Rol no encontrado
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    handleInputErrors,
    updateRol
)

/**
 * @swagger
 * /api/roles/{id}:
 *      delete:
 *          summary: Elimina un rol
 *          tags:
 *              - Roles
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Rol eliminado
 *              404:
 *                  description: Rol no encontrado
 *              400:
 *                  description: No se puede eliminar por usuarios asignados
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteRol
)

export default router
