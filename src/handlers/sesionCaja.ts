import { Request, Response } from 'express'
import SesionCaja from '../models/SesionCaja'
import Caja from '../models/Caja'
import Venta from '../models/Venta'
import VentaDetalle from '../models/VentaDetalle'
import Producto from '../models/Producto'
import { getNegocioId } from '../middleware/auth'

export const getSesionActiva = async (req: Request, res: Response) => {
    try {
        const { usuario_id } = req.query
        if (!usuario_id) {
            return res.status(400).json({ error: 'usuario_id es requerido' })
        }

        const sesion = await SesionCaja.findOne({
            where: { usuario_id: Number(usuario_id), cierre_fecha: null },
            include: [{ model: Caja, attributes: ['id', 'nombre'] }]
        })

        res.json({ data: sesion })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener la sesión activa' })
    }
}

export const getCajasDisponibles = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const where: any = { estado: 'CERRADA' }
        if (negocioId) where.negocio_id = negocioId

        const cajas = await Caja.findAll({ where, order: [['nombre', 'ASC']] })
        res.json({ data: cajas })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener las cajas disponibles' })
    }
}

export const createSesion = async (req: Request, res: Response) => {
    try {
        const { usuario_id, caja_id, monto_inicial } = req.body

        const sesionActiva = await SesionCaja.findOne({
            where: { usuario_id, cierre_fecha: null }
        })
        if (sesionActiva) {
            return res.status(400).json({ error: 'El usuario ya tiene una sesión de caja abierta' })
        }

        const caja = await Caja.findByPk(caja_id)
        if (!caja) return res.status(404).json({ error: 'Caja no encontrada' })

        // Validar que la caja pertenece al negocio del usuario
        const negocioId = getNegocioId(req)
        if (negocioId && caja.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'Esta caja no pertenece a tu negocio' })
        }

        if (caja.estado === 'ABIERTA') {
            return res.status(400).json({ error: 'Esta caja ya está siendo utilizada por otro cajero' })
        }

        await caja.update({ estado: 'ABIERTA' })

        const sesion = await SesionCaja.create({
            usuario_id, caja_id, monto_inicial, apertura_fecha: new Date()
        })

        const sesionConCaja = await SesionCaja.findByPk(sesion.id, {
            include: [{ model: Caja, attributes: ['id', 'nombre'] }]
        })

        res.status(201).json({ data: sesionConCaja })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al abrir la sesión de caja' })
    }
}

export const closeSesion = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const { monto_final_real } = req.body

        const sesion = await SesionCaja.findByPk(id, {
            include: [{ model: Caja, attributes: ['id', 'negocio_id'] }]
        })
        if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' })
        if (sesion.cierre_fecha) return res.status(400).json({ error: 'La sesión ya se encuentra cerrada' })

        // Validar que la sesión pertenece al negocio del usuario
        const negocioId = getNegocioId(req)
        if (negocioId && sesion.caja?.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta sesión' })
        }

        const caja = await Caja.findByPk(sesion.caja_id)
        if (caja) await caja.update({ estado: 'CERRADA' })

        await sesion.update({ monto_final_real, cierre_fecha: new Date() })
        res.json({ data: sesion })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al cerrar la sesión de caja' })
    }
}

export const getVentasBySesion = async (req: Request, res: Response) => {
    try {
        const sesionId = Number(req.params.sesionId)
        const negocioId = getNegocioId(req)

        // Validar que la sesión pertenece al negocio del usuario
        if (negocioId) {
            const sesion = await SesionCaja.findByPk(sesionId, {
                include: [{ model: Caja, attributes: ['negocio_id'] }]
            })
            if (!sesion || sesion.caja?.negocio_id !== negocioId) {
                return res.status(403).json({ error: 'No tienes acceso a esta sesión' })
            }
        }

        const ventas = await Venta.findAll({
            where: { sesion_id: sesionId },
            include: [{
                model: VentaDetalle,
                include: [{ model: Producto, attributes: ['nombre', 'precio'] }]
            }],
            order: [['fecha', 'DESC']]
        })

        res.json({ data: ventas })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener las ventas de la sesión' })
    }
}
