import { Router } from "express"
import { body } from "express-validator"
import { login, me, updatePerfil, forgotPassword, resetPassword } from "../handlers/auth"
import { handleInputErrors } from "../middleware"
import { authenticate } from "../middleware/auth"

const router: Router = Router()

/**
 * @swagger
 * /api/auth/login:
 *      post:
 *          summary: Iniciar sesión
 *          tags:
 *              - Autenticación
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  format: email
 *                              password:
 *                                  type: string
 *                      example:
 *                          email: "admin@cocktail.com"
 *                          password: "admin123"
 *          responses:
 *              200:
 *                  description: Login exitoso, retorna token JWT y datos del usuario
 *              401:
 *                  description: Credenciales incorrectas
 */
router.post('/login',
    body('email').isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    handleInputErrors,
    login
)

/**
 * @swagger
 * /api/auth/me:
 *      get:
 *          summary: Obtiene los datos del usuario autenticado
 *          tags:
 *              - Autenticación
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Datos del usuario autenticado
 *              401:
 *                  description: No autenticado
 */
router.get('/me', authenticate, me)

router.patch('/perfil', authenticate,
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('password_nueva').optional().isLength({ min: 6 }).withMessage('La contraseña nueva debe tener al menos 6 caracteres'),
    handleInputErrors,
    updatePerfil
)

router.post('/forgot-password',
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    forgotPassword
)

router.post('/reset-password',
    body('token').notEmpty().withMessage('Token requerido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleInputErrors,
    resetPassword
)

export default router
