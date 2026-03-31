import { Request, Response } from 'express'
import Caja from '../models/Caja'
import Negocio from '../models/Negocio'
import { getNegocioId } from '../middleware/auth'

export const getCajas = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const where = negocioId ? { negocio_id: negocioId } : {}

        const cajas = await Caja.findAll({
            where,
            order: [['nombre', 'ASC']],
            include: [{ model: Negocio, attributes: ['nombre'] }]
        })
        res.json({ data: cajas })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener las cajas' })
    }
}

export const getCajaById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const caja = await Caja.findByPk(id, {
            include: [{ model: Negocio, attributes: ['nombre'] }]
        })
        if (!caja) return res.status(404).json({ error: 'Caja no encontrada' })

        const negocioId = getNegocioId(req)
        if (negocioId && caja.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta caja' })
        }

        res.json({ data: caja })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener la caja' })
    }
}

export const createCaja = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const caja = await Caja.create({ ...req.body, negocio_id: negocioId })
        res.status(201).json({ data: caja })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear la caja' })
    }
}

export const updateCaja = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const caja = await Caja.findByPk(id)
        if (!caja) return res.status(404).json({ error: 'Caja no encontrada' })

        const negocioId = getNegocioId(req)
        if (negocioId && caja.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta caja' })
        }

        await caja.update(req.body)
        res.json({ data: caja })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar la caja' })
    }
}

export const deleteCaja = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const caja = await Caja.findByPk(id)
        if (!caja) return res.status(404).json({ error: 'Caja no encontrada' })

        const negocioId = getNegocioId(req)
        if (negocioId && caja.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta caja' })
        }

        await caja.destroy()
        res.json({ data: 'Caja eliminada' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar la caja' })
    }
}
