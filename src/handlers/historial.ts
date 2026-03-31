import { Request, Response } from 'express'
import { Op } from 'sequelize'
import Venta from '../models/Venta'
import VentaDetalle from '../models/VentaDetalle'
import Producto from '../models/Producto'
import SesionCaja from '../models/SesionCaja'
import Caja from '../models/Caja'
import Usuario from '../models/Usuario'
import { getNegocioId } from '../middleware/auth'

function buildDateFilter(fecha_desde?: string, fecha_hasta?: string) {
    const where: any = {}
    if (fecha_desde && fecha_hasta) {
        where.fecha = {
            [Op.between]: [
                new Date(`${fecha_desde}T00:00:00`),
                new Date(`${fecha_hasta}T23:59:59.999`)
            ]
        }
    } else if (fecha_desde) {
        where.fecha = { [Op.gte]: new Date(`${fecha_desde}T00:00:00`) }
    } else if (fecha_hasta) {
        where.fecha = { [Op.lte]: new Date(`${fecha_hasta}T23:59:59.999`) }
    }
    return where
}

function buildSesionInclude(caja_id?: string, negocioId?: number | null) {
    const cajaInclude: any = { model: Caja, attributes: ['id', 'nombre'] }

    const include: any = {
        model: SesionCaja,
        include: [
            cajaInclude,
            { model: Usuario, attributes: ['id', 'nombre'] }
        ]
    }

    const where: any = {}
    if (caja_id) where.caja_id = Number(caja_id)

    // Si hay negocio_id, filtrar cajas de ese negocio con INNER JOIN
    if (negocioId) {
        cajaInclude.where = { negocio_id: negocioId }
        cajaInclude.required = true
        include.required = true // INNER JOIN en SesionCaja también
    }

    if (Object.keys(where).length > 0) include.where = where
    return include
}

export const getHistorialVentas = async (req: Request, res: Response) => {
    try {
        const { fecha_desde, fecha_hasta, caja_id, metodo_pago, page = '1', limit = '50' } = req.query
        const negocioId = getNegocioId(req)

        const whereVenta = buildDateFilter(fecha_desde as string, fecha_hasta as string)
        if (metodo_pago) whereVenta.metodo_pago = metodo_pago

        const offset = (Number(page) - 1) * Number(limit)

        const { count, rows: ventas } = await Venta.findAndCountAll({
            where: whereVenta,
            include: [
                buildSesionInclude(caja_id as string, negocioId),
                {
                    model: VentaDetalle,
                    include: [{ model: Producto, attributes: ['id', 'nombre', 'precio'] }]
                }
            ],
            order: [['fecha', 'DESC']],
            limit: Number(limit),
            offset,
            distinct: true
        })

        res.json({
            data: ventas,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(count / Number(limit))
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el historial de ventas' })
    }
}

export const getResumenVentas = async (req: Request, res: Response) => {
    try {
        const { fecha_desde, fecha_hasta, caja_id } = req.query
        const negocioId = getNegocioId(req)

        const whereVenta = buildDateFilter(fecha_desde as string, fecha_hasta as string)

        const ventas = await Venta.findAll({
            where: whereVenta,
            include: [
                buildSesionInclude(caja_id as string, negocioId),
                {
                    model: VentaDetalle,
                    include: [{ model: Producto, attributes: ['id', 'nombre'] }]
                }
            ],
            order: [['fecha', 'DESC']]
        })

        const ventasJson = ventas.map(v => v.toJSON())

        const total_ventas = ventasJson.length
        const monto_total = ventasJson.reduce((acc, v) => acc + Number(v.total), 0)

        const metodoMap = new Map<string, { cantidad: number; monto: number }>()
        for (const v of ventasJson) {
            const entry = metodoMap.get(v.metodo_pago) || { cantidad: 0, monto: 0 }
            entry.cantidad++
            entry.monto += Number(v.total)
            metodoMap.set(v.metodo_pago, entry)
        }
        const por_metodo_pago = Array.from(metodoMap.entries()).map(([metodo_pago, data]) => ({
            metodo_pago, cantidad: data.cantidad, monto: data.monto
        }))

        const cajaMap = new Map<number, { nombre: string; cantidad: number; monto: number }>()
        for (const v of ventasJson) {
            const sesion = v.sesion || v.SesionCaja
            if (!sesion) continue
            const caja = sesion.caja || sesion.Caja
            if (!caja) continue
            const entry = cajaMap.get(caja.id) || { nombre: caja.nombre, cantidad: 0, monto: 0 }
            entry.cantidad++
            entry.monto += Number(v.total)
            cajaMap.set(caja.id, entry)
        }
        const por_caja = Array.from(cajaMap.entries()).map(([caja_id, data]) => ({
            caja_id, caja_nombre: data.nombre, cantidad: data.cantidad, monto: data.monto
        }))

        const productoMap = new Map<number, { nombre: string; total_cantidad: number; total_monto: number }>()
        for (const v of ventasJson) {
            const detalles = v.detalles || v.VentaDetalles || []
            for (const d of detalles) {
                const prod = d.producto || d.Producto
                const nombre = prod?.nombre || `Producto #${d.producto_id}`
                const entry = productoMap.get(d.producto_id) || { nombre, total_cantidad: 0, total_monto: 0 }
                entry.total_cantidad += Number(d.cantidad)
                entry.total_monto += Number(d.subtotal)
                productoMap.set(d.producto_id, entry)
            }
        }
        const top_productos = Array.from(productoMap.entries())
            .map(([producto_id, data]) => ({ producto_id, producto_nombre: data.nombre, ...data }))
            .sort((a, b) => b.total_cantidad - a.total_cantidad)
            .slice(0, 10)

        res.json({
            data: { total_ventas, monto_total, por_metodo_pago, por_caja, top_productos }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el resumen de ventas' })
    }
}
