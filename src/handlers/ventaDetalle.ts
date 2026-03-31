import { Request, Response } from 'express'
import VentaDetalle from '../models/VentaDetalle'
import Venta from '../models/Venta'
import Producto from '../models/Producto'
import SesionCaja from '../models/SesionCaja'
import Caja from '../models/Caja'
import { getNegocioId } from '../middleware/auth'

// Helper: validar que un detalle pertenece al negocio del usuario
async function validarDetalleNegocio(detalleId: number, negocioId: number | null): Promise<VentaDetalle | null> {
    const detalle = await VentaDetalle.findByPk(detalleId, {
        include: [{
            model: Venta,
            include: [{ model: SesionCaja, include: [{ model: Caja, attributes: ['negocio_id'] }] }]
        }]
    })
    if (!detalle) return null
    if (negocioId && detalle.venta?.sesion?.caja?.negocio_id !== negocioId) return null
    return detalle
}

export const getVentaDetalles = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)

        const detalles = await VentaDetalle.findAll({
            include: [
                {
                    model: Venta,
                    attributes: ['id', 'fecha'],
                    include: [{
                        model: SesionCaja,
                        attributes: ['id'],
                        include: [{ model: Caja, attributes: ['id'], ...(negocioId ? { where: { negocio_id: negocioId }, required: true } : {}) }],
                        required: !!negocioId
                    }],
                    required: !!negocioId
                },
                { model: Producto, attributes: ['nombre', 'precio'] }
            ]
        })
        res.json({ data: detalles })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener los detalles de venta' })
    }
}

export const getVentaDetalleById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocioId = getNegocioId(req)

        const detalle = await validarDetalleNegocio(id, negocioId)
        if (!detalle) return res.status(404).json({ error: 'Detalle de venta no encontrado' })

        res.json({ data: detalle })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el detalle de venta' })
    }
}

export const createVentaDetalle = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)

        // Validar que la venta pertenece al negocio
        if (negocioId && req.body.venta_id) {
            const venta = await Venta.findByPk(req.body.venta_id, {
                include: [{ model: SesionCaja, include: [{ model: Caja, attributes: ['negocio_id'] }] }]
            })
            if (!venta || venta.sesion?.caja?.negocio_id !== negocioId) {
                return res.status(403).json({ error: 'No tienes acceso a esta venta' })
            }
        }

        const detalle = await VentaDetalle.create(req.body)
        res.status(201).json({ data: detalle })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear el detalle de venta' })
    }
}

export const updateVentaDetalle = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocioId = getNegocioId(req)

        const detalle = await validarDetalleNegocio(id, negocioId)
        if (!detalle) return res.status(404).json({ error: 'Detalle de venta no encontrado' })

        await detalle.update(req.body)
        res.json({ data: detalle })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el detalle de venta' })
    }
}

export const deleteVentaDetalle = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocioId = getNegocioId(req)

        const detalle = await validarDetalleNegocio(id, negocioId)
        if (!detalle) return res.status(404).json({ error: 'Detalle de venta no encontrado' })

        await detalle.destroy()
        res.json({ data: 'Detalle de venta eliminado' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar el detalle de venta' })
    }
}
