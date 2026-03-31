import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Negocio from '../models/Negocio'

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        ;(req as any).user = decoded

        // Verificar que el negocio esté activo en cada request (excepto superadmin)
        if (decoded.rol_nombre !== 'superadmin' && decoded.negocio_id) {
            const negocio = await Negocio.findByPk(decoded.negocio_id, { attributes: ['id', 'activo'] })
            if (!negocio || !negocio.activo) {
                return res.status(403).json({ error: 'Tu cuenta está suspendida. Contacta al proveedor del sistema.' })
            }
        }

        next()
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' })
    }
}

export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user

        if (!user) {
            return res.status(401).json({ error: 'No autenticado' })
        }

        // superadmin tiene acceso a todo
        if (user.rol_nombre === 'superadmin') {
            return next()
        }

        if (!allowedRoles.includes(user.rol_nombre)) {
            return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' })
        }

        next()
    }
}

// Helper: obtener negocio_id del usuario autenticado
// Usa el negocio_id del JWT. Si necesitás datos frescos, usá getNegocioIdFromDB.
export function getNegocioId(req: Request): number | null {
    const user = (req as any).user
    if (!user) return null
    if (user.rol_nombre === 'superadmin') return null
    return user.negocio_id
}

// Helper: verificar si es superadmin
export function isSuperAdmin(req: Request): boolean {
    return (req as any).user?.rol_nombre === 'superadmin'
}
