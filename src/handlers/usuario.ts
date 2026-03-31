import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario'
import Rol from '../models/Rol'
import Negocio from '../models/Negocio'
import SesionCaja from '../models/SesionCaja'
import { getNegocioId, isSuperAdmin } from '../middleware/auth'

export const getUsuarios = async (req: Request, res: Response) => {
    try {
        const negocioId = getNegocioId(req)
        const where: any = {}
        if (negocioId) where.negocio_id = negocioId

        const usuarios = await Usuario.findAll({
            where,
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Rol, attributes: ['id', 'nombre'] },
                { model: Negocio, attributes: ['id', 'nombre'] }
            ],
            order: [['nombre', 'ASC']]
        })
        res.json({ data: usuarios })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener los usuarios' })
    }
}

export const getUsuarioById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Rol, attributes: ['id', 'nombre'] },
                { model: Negocio, attributes: ['id', 'nombre'] }
            ]
        })
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && usuario.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este usuario' })
        }

        res.json({ data: usuario })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el usuario' })
    }
}

export const createUsuario = async (req: Request, res: Response) => {
    try {
        const { password_hash, ...rest } = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password_hash, salt)

        const negocioId = getNegocioId(req)

        // Admin solo puede crear cajeros en su negocio
        if (negocioId) {
            rest.negocio_id = negocioId
        }

        const usuario = await Usuario.create({
            ...rest,
            password_hash: hashedPassword
        })

        const result = usuario.toJSON()
        delete result.password_hash
        res.status(201).json({ data: result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear el usuario' })
    }
}

export const updateUsuario = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const usuario = await Usuario.findByPk(id)
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && usuario.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este usuario' })
        }

        const updateData = { ...req.body }
        if (updateData.password_hash && updateData.password_hash.trim() !== '') {
            const salt = await bcrypt.genSalt(10)
            updateData.password_hash = await bcrypt.hash(updateData.password_hash, salt)
        } else {
            delete updateData.password_hash
        }

        // No permitir cambiar de negocio si no es superadmin
        if (negocioId) delete updateData.negocio_id

        await usuario.update(updateData)

        const result = usuario.toJSON()
        delete result.password_hash
        res.json({ data: result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el usuario' })
    }
}

export const deactivateUsuario = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const usuario = await Usuario.findByPk(id)
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && usuario.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este usuario' })
        }

        usuario.activo = false
        await usuario.save()
        res.json({ data: 'Usuario desactivado correctamente' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al desactivar el usuario' })
    }
}

export const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const usuario = await Usuario.findByPk(id)
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

        const negocioId = getNegocioId(req)
        if (negocioId && usuario.negocio_id !== negocioId) {
            return res.status(403).json({ error: 'No tienes acceso a este usuario' })
        }

        const sessionsCount = await SesionCaja.count({ where: { usuario_id: id } })
        if (sessionsCount > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el usuario porque tiene sesiones asociadas. Use la desactivación.'
            })
        }

        await usuario.destroy()
        res.json({ data: 'Usuario eliminado' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar el usuario' })
    }
}
