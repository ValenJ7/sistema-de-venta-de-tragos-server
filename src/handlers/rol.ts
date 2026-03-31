import { Request, Response } from 'express'
import Rol from '../models/Rol'
import Usuario from '../models/Usuario'

export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await Rol.findAll({
            order: [['nombre', 'ASC']]
        })
        res.json({ data: roles })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener los roles' })
    }
}

export const createRol = async (req: Request, res: Response) => {
    try {
        const rol = await Rol.create(req.body)
        res.status(201).json({ data: rol })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear el rol' })
    }
}

export const updateRol = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const rol = await Rol.findByPk(id)

        if (!rol) {
            return res.status(404).json({
                error: 'Rol no encontrado'
            })
        }

        // Actualizar
        await rol.update(req.body)
        res.json({ data: rol })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el rol' })
    }
}

export const deleteRol = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const rol = await Rol.findByPk(id, {
            include: [{ model: Usuario }]
        })

        if (!rol) {
            return res.status(404).json({
                error: 'Rol no encontrado'
            })
        }

        // Verificar si tiene usuarios asociados
        const usuariosCount = await Usuario.count({ where: { rol_id: id } })
        if (usuariosCount > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el rol porque tiene usuarios asignados'
            })
        }

        await rol.destroy()
        res.json({ data: 'Rol eliminado' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar el rol' })
    }
}
