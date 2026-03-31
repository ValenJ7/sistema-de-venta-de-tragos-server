import { Request, Response } from 'express'
import Categoria from '../models/Categoria'
import { getNegocioId } from '../middleware/auth'

export const getCategorias = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const where = negocioId ? { negocio_id: negocioId } : {}

        const categorias = await Categoria.findAll({ where, order: [['nombre', 'ASC']] })
        res.json({ data: categorias })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener las categorías' })
    }
}

export const getCategoriaById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const categoria = await Categoria.findByPk(id)
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' })

        const negocioId = getNegocioId(req)
        if (negocioId && categoria.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta categoría' })
        }

        res.json({ data: categoria })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener la categoría' })
    }
}

export const createCategoria = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const categoria = await Categoria.create({ ...req.body, negocio_id: negocioId })
        res.status(201).json({ data: categoria })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear la categoría' })
    }
}

export const updateCategoria = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const categoria = await Categoria.findByPk(id)
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' })

        const negocioId = getNegocioId(req)
        if (negocioId && categoria.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta categoría' })
        }

        await categoria.update(req.body)
        res.json({ data: categoria })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar la categoría' })
    }
}

export const deleteCategoria = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const categoria = await Categoria.findByPk(id)
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' })

        const negocioId = getNegocioId(req)
        if (negocioId && categoria.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a esta categoría' })
        }

        await categoria.destroy()
        res.json({ data: 'Categoría eliminada' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar la categoría' })
    }
}
