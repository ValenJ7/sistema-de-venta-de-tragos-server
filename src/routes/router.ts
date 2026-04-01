import { Router } from "express"
import categoriaRouter from "./categoriaRouter"
import productoRouter from "./productoRouter"
import cajaRouter from "./cajaRouter"
import rolRouter from "./rolRouter"
import usuarioRouter from "./usuarioRouter"
import sesionCajaRouter from "./sesionCajaRouter"
import ventaRouter from "./ventaRouter"
import ventaDetalleRouter from "./ventaDetalleRouter"
import negocioRouter from "./negocioRouter"
import authRouter from "./authRouter"
import dashboardRouter from "./dashboardRouter"
import historialRouter from "./historialRouter"
import { authenticate, authorize } from "../middleware/auth"

const router: Router = Router()

// Rutas públicas
router.use('/auth', authRouter)

// Rutas protegidas (requieren autenticación)
router.use('/categorias', authenticate, categoriaRouter)
router.use('/productos', authenticate, productoRouter)
router.use('/cajas', authenticate, cajaRouter)
router.use('/roles', authenticate, authorize('admin', 'superadmin'), rolRouter)
router.use('/usuarios', authenticate, authorize('admin', 'superadmin'), usuarioRouter)
router.use('/sesiones', authenticate, sesionCajaRouter)
router.use('/ventas', authenticate, ventaRouter)
router.use('/venta-detalles', authenticate, ventaDetalleRouter)
router.use('/dashboard', authenticate, dashboardRouter)
router.use('/historial', authenticate, historialRouter)

// Solo superadmin
router.use('/negocios', authenticate, authorize('superadmin'), negocioRouter)

export default router
