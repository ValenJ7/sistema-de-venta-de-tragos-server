import { Request, Response } from 'express'
import Caja from '../models/Caja'
import SesionCaja from '../models/SesionCaja'
import Usuario from '../models/Usuario'
import Venta from '../models/Venta'
import VentaDetalle from '../models/VentaDetalle'
import Producto from '../models/Producto'
import { getNegocioId } from '../middleware/auth'

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const whereCaja = negocioId ? { negocio_id: negocioId } : {}

        const cajas = await Caja.findAll({ where: whereCaja, order: [['id', 'ASC']] })

        const cajaIds = cajas.map(c => c.id)

        const sesionesActivas = await SesionCaja.findAll({
            where: {
                cierre_fecha: null,
                ...(cajaIds.length > 0 ? { caja_id: cajaIds } : { caja_id: -1 })
            },
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'email'] },
                { model: Venta }
            ]
        })

        const result = cajas.map(caja => {
            const sesion = sesionesActivas.find(s => s.caja_id === caja.id)
            const sesionJson = sesion ? sesion.toJSON() : null

            let ventasCount = 0
            let ventasTotal = 0

            if (sesionJson) {
                const ventas = sesionJson.ventas || []
                ventasCount = ventas.length
                ventasTotal = ventas.reduce((acc: number, v: any) => acc + Number(v.total), 0)
            }

            return {
                id: caja.id,
                nombre: caja.nombre,
                estado: caja.estado,
                sesion_activa: sesionJson ? {
                    id: sesionJson.id,
                    usuario: sesionJson.usuario,
                    apertura_fecha: sesionJson.apertura_fecha,
                    monto_inicial: sesionJson.monto_inicial
                } : null,
                ventas_count: ventasCount,
                ventas_total: ventasTotal
            }
        })

        res.json({ data: result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el dashboard' })
    }
}

export const getDetalleSesion = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)

        const sesion = await SesionCaja.findByPk(id, {
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'email'] },
                { model: Caja, attributes: ['id', 'nombre'] },
                {
                    model: Venta,
                    include: [{
                        model: VentaDetalle,
                        include: [{ model: Producto, attributes: ['nombre', 'precio'] }]
                    }]
                }
            ]
        })

        if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' })

        // Validar acceso por negocio
        const negocioId = getNegocioId(req)
        if (negocioId) {
            const caja = await Caja.findByPk(sesion.caja_id)
            if (caja && caja.negocio_id !== negocioId) {
                return res.status(403).json({ error: 'No tienes acceso a esta sesión' })
            }
        }

        res.json({ data: sesion })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el detalle de la sesión' })
    }
}
