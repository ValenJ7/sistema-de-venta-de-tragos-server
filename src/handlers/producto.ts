import { Request, Response } from 'express'
import Producto from '../models/Producto'
import Categoria from '../models/Categoria'
import { getNegocioId } from '../middleware/auth'

export const getProductos = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const where = negocioId ? { negocio_id: negocioId } : {}

        const productos = await Producto.findAll({
            where,
            order: [['nombre', 'ASC']],
            include: [{ model: Categoria, attributes: ['nombre'] }]
        })
        res.json({ data: productos })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener los productos' })
    }
}

export const getProductoById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const producto = await Producto.findByPk(id, {
            include: [{ model: Categoria, attributes: ['nombre'] }]
        })
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && producto.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este producto' })
        }

        res.json({ data: producto })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el producto' })
    }
}

export const createProducto = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const producto = await Producto.create({ ...req.body, negocio_id: negocioId })
        res.status(201).json({ data: producto })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear el producto' })
    }
}

export const updateProducto = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const producto = await Producto.findByPk(id)
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && producto.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este producto' })
        }

        await producto.update(req.body)
        res.json({ data: producto })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el producto' })
    }
}

export const deleteProducto = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const producto = await Producto.findByPk(id)
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && producto.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este producto' })
        }

        await producto.destroy()
        res.json({ data: 'Producto eliminado' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar el producto' })
    }
}
