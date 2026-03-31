import { Request, Response } from 'express'
import Venta from '../models/Venta'
import SesionCaja from '../models/SesionCaja'
import VentaDetalle from '../models/VentaDetalle'
import Producto from '../models/Producto'
import Caja from '../models/Caja'
import db from '../config/db'
import { getNegocioId } from '../middleware/auth'

// Helper: validar que una sesión pertenece al negocio del usuario
async function validarSesionNegocio(sesionId: number, negocioId: number | null): Promise<SesionCaja | null> {
    const sesion = await SesionCaja.findByPk(sesionId, {
        include: [{ model: Caja, attributes: ['id', 'negocio_id'] }]
    })
    if (!sesion) return null
    if (negocioId && sesion.caja?.negocio_id !== negocioId) return null
    return sesion
}

export const getVentas = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)

        const ventas = await Venta.findAll({
            include: [
                {
                    model: SesionCaja,
                    attributes: ['id', 'caja_id'],
                    include: [{ model: Caja, attributes: ['id', 'nombre'], ...(negocioId ? { where: { negocio_id: negocioId }, required: true } : {}) }],
                    required: !!negocioId
                },
                { model: VentaDetalle, include: [{ model: Producto, attributes: ['nombre'] }] }
            ],
            order: [['fecha', 'DESC']]
        })
        res.json({ data: ventas })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener las ventas' })
    }
}

export const getVentaById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocioId = getNegocioId(req)

        const venta = await Venta.findByPk(id, {
            include: [
                {
                    model: SesionCaja,
                    attributes: ['id', 'caja_id'],
                    include: [{ model: Caja, attributes: ['id', 'nombre'] }]
                },
                { model: VentaDetalle, include: [{ model: Producto, attributes: ['nombre'] }] }
            ]
        })

        if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })

        // Validar acceso por negocio
        if (negocioId && venta.sesion?.caja?.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta venta' })
        }

        res.json({ data: venta })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener la venta' })
    }
}

// Endpoint transaccional: crea venta + detalles en una sola operación
export const createVenta = async (req: Request, res: Response) => {
    const t = await db.transaction()
    try {
        const { sesion_id, total, metodo_pago, detalles } = req.body
        const negocioId = getNegocioId(req)

        // Validar que la sesión pertenece al negocio
        const sesion = await validarSesionNegocio(sesion_id, negocioId)
        if (!sesion) return res.status(403).json({ error: 'Sesión no válida o no pertenece a tu negocio' })
        if (sesion.cierre_fecha) return res.status(400).json({ error: 'No se puede vender en una sesión cerrada' })

        const venta = await Venta.create({
            sesion_id, total, metodo_pago, fecha: new Date()
        }, { transaction: t })

        // Si vienen detalles, crearlos en la misma transacción
        if (detalles && Array.isArray(detalles) && detalles.length > 0) {
            const detallesData = detalles.map((d: any) => ({
                venta_id: venta.id,
                producto_id: d.producto_id,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                subtotal: d.subtotal
            }))
            await VentaDetalle.bulkCreate(detallesData, { transaction: t })
        }

        await t.commit()

        // Devolver la venta con sus detalles
        const ventaCompleta = await Venta.findByPk(venta.id, {
            include: [{ model: VentaDetalle, include: [{ model: Producto, attributes: ['nombre', 'precio'] }] }]
        })

        res.status(201).json({ data: ventaCompleta })
    } catch (error) {
        await t.rollback()
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear la venta' })
    }
}

export const updateVenta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocioId = getNegocioId(req)

        const venta = await Venta.findByPk(id, {
            include: [{ model: SesionCaja, include: [{ model: Caja, attributes: ['negocio_id'] }] }]
        })
        if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })

        if (negocioId && venta.sesion?.caja?.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta venta' })
        }

        await venta.update(req.body)
        res.json({ data: venta })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar la venta' })
    }
}

export const deleteVenta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocioId = getNegocioId(req)

        const venta = await Venta.findByPk(id, {
            include: [{ model: SesionCaja, include: [{ model: Caja, attributes: ['negocio_id'] }] }]
        })
        if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })

        if (negocioId && venta.sesion?.caja?.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta venta' })
        }

        await venta.destroy()
        res.json({ data: 'Venta eliminada' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar la venta' })
    }
}
