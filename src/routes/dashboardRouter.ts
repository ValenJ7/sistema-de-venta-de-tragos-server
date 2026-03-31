import { Router } from "express"
import { param } from "express-validator"
import { getDashboard, getDetalleSesion } from "../handlers/dashboard"
import { handleInputErrors } from "../middleware"
import { authenticate, authorize } from "../middleware/auth"

const router: Router = Router()

/**
 * @swagger
 * /api/dashboard:
 *      get:
 *          summary: Obtiene el estado de todas las cajas con sus sesiones y ventas
 *          tags:
 *              - Dashboard
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Dashboard con datos agregados de todas las cajas
 */
router.get('/', authenticate, authorize('admin'), getDashboard)

/**
 * @swagger
 * /api/dashboard/sesion/{id}:
 *      get:
 *          summary: Obtiene el detalle completo de una sesión de caja
 *          tags:
 *              - Dashboard
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Detalle de la sesión con ventas
 *              404:
 *                  description: Sesión no encontrada
 */
router.get('/sesion/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    authenticate,
    authorize('admin'),
    getDetalleSesion
)

export default router
