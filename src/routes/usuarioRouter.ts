import { Router } from "express"
import { body, param } from "express-validator"
import {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deactivateUsuario,
    deleteUsuario
} from "../handlers/usuario"
import { handleInputErrors } from "../middleware"

const router: Router = Router()

/**
 * @swagger
 * components:
 *      schemas:
 *          Usuario:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                      example: 1
 *                  nombre:
 *                      type: string
 *                      example: "Juan Perez"
 *                  email:
 *                      type: string
 *                      format: email
 *                      example: "juan@example.com"
 *                  rol_id:
 *                      type: integer
 *                      example: 1
 *                  activo:
 *                      type: boolean
 *                      example: true
 *                  negocio_id:
 *                      type: integer
 *                      example: 1
 *                  rol:
 *                      $ref: '#/components/schemas/Rol'
 *                  negocio:
 *                      $ref: '#/components/schemas/Negocio'
 */

/**
 * @swagger
 * /api/usuarios:
 *      get:
 *          summary: Obtiene todos los usuarios
 *          tags:
 *              - Usuarios
 *          responses:
 *              200:
 *                  description: Lista de usuarios
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Usuario'
 */
router.get('/', getUsuarios)

/**
 * @swagger
 * /api/usuarios/{id}:
 *      get:
 *          summary: Obtiene un usuario por ID
 *          tags:
 *              - Usuarios
 *          parameters:
 *              - in: path
 *                name: id
 *                description: El ID del usuario a buscar
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Éxito
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Usuario'
 *              404:
 *                  description: Usuario no encontrado
 */
router.get('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    getUsuarioById
)

/**
 * @swagger
 * /api/usuarios:
 *      post:
 *          summary: Crea un nuevo usuario
 *          tags:
 *              - Usuarios
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nombre:
 *                                  type: string
 *                              email:
 *                                  type: string
 *                              password_hash:
 *                                  type: string
 *                              rol_id:
 *                                  type: integer
 *                              negocio_id:
 *                                  type: integer
 *                      example:
 *                          nombre: "Juan Perez"
 *                          email: "juan@example.com"
 *                          password_hash: "password123"
 *                          rol_id: 1
 *                          negocio_id: 1
 *          responses:
 *              201:
 *                  description: Usuario creado
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Usuario'
 */
router.post('/',
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('email').isEmail().withMessage('Email no válido'),
    body('password_hash').notEmpty().withMessage('La contraseña no puede ir vacía'),
    body('rol_id').isInt().withMessage('El rol no es válido'),
    body('negocio_id').isInt().withMessage('El negocio no es válido'),
    handleInputErrors,
    createUsuario
)

/**
 * @swagger
 * /api/usuarios/{id}:
 *      put:
 *          summary: Actualiza un usuario existente
 *          tags:
 *              - Usuarios
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
 *                              email:
 *                                  type: string
 *                              rol_id:
 *                                  type: integer
 *                              negocio_id:
 *                                  type: integer
 *                              activo:
 *                                  type: boolean
 *                      example:
 *                          nombre: "Juan Perez Actualizado"
 *                          email: "juan.nuevo@example.com"
 *                          rol_id: 2
 *                          negocio_id: 1
 *                          activo: true
 *          responses:
 *              200:
 *                  description: Usuario actualizado
 *              404:
 *                  description: Usuario no encontrado
 */
router.put('/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('nombre').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('email').isEmail().withMessage('Email no válido'),
    body('rol_id').isInt().withMessage('El rol no es válido'),
    body('negocio_id').isInt().withMessage('El negocio no es válido'),
    handleInputErrors,
    updateUsuario
)

/**
 * @swagger
 * /api/usuarios/{id}/deactivate:
 *      patch:
 *          summary: Desactiva un usuario (borrado lógico)
 *          tags:
 *              - Usuarios
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Usuario desactivado correctamente
 *              404:
 *                  description: Usuario no encontrado
 */
router.patch('/:id/deactivate',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deactivateUsuario
)

/**
 * @swagger
 * /api/usuarios/{id}:
 *      delete:
 *          summary: Elimina un usuario físicamente
 *          tags:
 *              - Usuarios
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Usuario eliminado físicamente
 *              400:
 *                  description: No se puede eliminar por integridad referencial
 *              404:
 *                  description: Usuario no encontrado
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    deleteUsuario
)

export default router
