import { Router } from "express"
import { getHistorialVentas, getResumenVentas } from "../handlers/historial"
import { authenticate, authorize } from "../middleware/auth"

const router: Router = Router()

/**
 * @swagger
 * /api/historial/ventas:
 *      get:
 *          summary: Obtiene el historial de ventas con filtros
 *          tags:
 *              - Historial
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: query
 *                name: fecha_desde
 *                schema:
 *                    type: string
 *                    format: date
 *                description: Fecha de inicio (YYYY-MM-DD)
 *              - in: query
 *                name: fecha_hasta
 *                schema:
 *                    type: string
 *                    format: date
 *                description: Fecha de fin (YYYY-MM-DD)
 *              - in: query
 *                name: caja_id
 *                schema:
 *                    type: integer
 *                description: Filtrar por caja específica
 *              - in: query
 *                name: metodo_pago
 *                schema:
 *                    type: string
 *                description: Filtrar por método de pago
 *              - in: query
 *                name: page
 *                schema:
 *                    type: integer
 *                    default: 1
 *              - in: query
 *                name: limit
 *                schema:
 *                    type: integer
 *                    default: 50
 *          responses:
 *              200:
 *                  description: Lista de ventas con paginación
 */
router.get('/ventas', authenticate, authorize('admin'), getHistorialVentas)

/**
 * @swagger
 * /api/historial/resumen:
 *      get:
 *          summary: Obtiene un resumen/arqueo de ventas con filtros
 *          tags:
 *              - Historial
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: query
 *                name: fecha_desde
 *                schema:
 *                    type: string
 *                    format: date
 *              - in: query
 *                name: fecha_hasta
 *                schema:
 *                    type: string
 *                    format: date
 *              - in: query
 *                name: caja_id
 *                schema:
 *                    type: integer
 *          responses:
 *              200:
 *                  description: Resumen con totales, desglose por método de pago, por caja, y top productos
 */
router.get('/resumen', authenticate, authorize('admin'), getResumenVentas)

export default router
