import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import Negocio from '../models/Negocio'
import Usuario from '../models/Usuario'
import Caja from '../models/Caja'
import Rol from '../models/Rol'
import SesionCaja from '../models/SesionCaja'
import Venta from '../models/Venta'
import VentaDetalle from '../models/VentaDetalle'
import Categoria from '../models/Categoria'
import Producto from '../models/Producto'
import db from '../config/db'

// Solo superadmin
export const getNegocios = async (req: Request, res: Response) => {
    try {
        const negocios = await Negocio.findAll({
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'email', 'activo'] },
                { model: Caja, attributes: ['id', 'nombre', 'estado'] }
            ]
        })
        res.json({ data: negocios })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener los negocios' })
    }
}

export const getNegocioById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocio = await Negocio.findByPk(id, {
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'email', 'activo'] },
                { model: Caja, attributes: ['id', 'nombre', 'estado'] }
            ]
        })
        if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' })
        res.json({ data: negocio })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el negocio' })
    }
}

// Crear negocio + su admin inicial
export const createNegocio = async (req: Request, res: Response) => {
    try {
        const { nombre, config_moneda, admin_nombre, admin_email, admin_password } = req.body

        if (!nombre || !admin_nombre || !admin_email || !admin_password) {
            return res.status(400).json({
                error: 'Se requiere: nombre del negocio, admin_nombre, admin_email y admin_password'
            })
        }

        // Verificar email no duplicado
        const existingUser = await Usuario.findOne({ where: { email: admin_email } })
        if (existingUser) {
            return res.status(400).json({ error: 'Ya existe un usuario con ese email' })
        }

        // Crear negocio
        const negocio = await Negocio.create({ nombre, config_moneda })

        // Buscar rol admin
        const rolAdmin = await Rol.findOne({ where: { nombre: 'admin' } })
        if (!rolAdmin) {
            return res.status(500).json({ error: 'Rol admin no encontrado. Ejecuta el seed.' })
        }

        // Crear admin del negocio
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(admin_password, salt)

        const admin = await Usuario.create({
            nombre: admin_nombre,
            email: admin_email,
            password_hash: hashedPassword,
            rol_id: rolAdmin.id,
            negocio_id: negocio.id,
            activo: true
        })

        // Crear una caja por defecto
        await Caja.create({
            nombre: 'Caja Principal',
            negocio_id: negocio.id
        })

        const adminJson = admin.toJSON()
        delete adminJson.password_hash

        res.status(201).json({
            data: {
                negocio,
                admin: adminJson
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al crear el negocio' })
    }
}

export const updateNegocio = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocio = await Negocio.findByPk(id)
        if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' })

        await negocio.update(req.body)
        res.json({ data: negocio })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el negocio' })
    }
}

export const suspenderNegocio = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocio = await Negocio.findByPk(id)
        if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' })
        if (!negocio.activo) return res.status(400).json({ error: 'El negocio ya está suspendido' })

        await negocio.update({ activo: false })
        res.json({ data: negocio })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al suspender el negocio' })
    }
}

export const activarNegocio = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const negocio = await Negocio.findByPk(id)
        if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' })
        if (negocio.activo) return res.status(400).json({ error: 'El negocio ya está activo' })

        await negocio.update({ activo: true })
        res.json({ data: negocio })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al activar el negocio' })
    }
}

export const deleteNegocio = async (req: Request, res: Response) => {
    const t = await db.transaction()
    try {
        const id = Number(req.params.id)
        const negocio = await Negocio.findByPk(id)
        if (!negocio) { await t.rollback(); return res.status(404).json({ error: 'Negocio no encontrado' }) }

        // Eliminar en orden por FK: detalles → ventas → sesiones → cajas → usuarios → categorías → productos → negocio
        const cajas = await Caja.findAll({ where: { negocio_id: id }, transaction: t })
        const cajaIds = cajas.map(c => c.id)

        if (cajaIds.length > 0) {
            const sesiones = await SesionCaja.findAll({ where: { caja_id: cajaIds }, transaction: t })
            const sesionIds = sesiones.map(s => s.id)

            if (sesionIds.length > 0) {
                const ventas = await Venta.findAll({ where: { sesion_id: sesionIds }, transaction: t })
                const ventaIds = ventas.map(v => v.id)
                if (ventaIds.length > 0) {
                    await VentaDetalle.destroy({ where: { venta_id: ventaIds }, transaction: t })
                    await Venta.destroy({ where: { id: ventaIds }, transaction: t })
                }
                await SesionCaja.destroy({ where: { id: sesionIds }, transaction: t })
            }
            await Caja.destroy({ where: { negocio_id: id }, transaction: t })
        }

        await Usuario.destroy({ where: { negocio_id: id }, transaction: t })
        await Categoria.destroy({ where: { negocio_id: id }, transaction: t })
        await Producto.destroy({ where: { negocio_id: id }, transaction: t })
        await negocio.destroy({ transaction: t })

        await t.commit()
        res.json({ data: 'Negocio eliminado' })
    } catch (error) {
        await t.rollback()
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al eliminar el negocio' })
    }
}
