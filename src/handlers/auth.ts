import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Usuario from '../models/Usuario'
import Rol from '../models/Rol'
import Negocio from '../models/Negocio'

async function sendResetEmail(to: string, resetLink: string) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM || 'onboarding@resend.dev',
            to,
            subject: 'Restablecer contraseña',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
                    <h2 style="color:#ea580c;">Restablecer contraseña</h2>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                    <p>Hacé click en el botón para crear una nueva contraseña. El link expira en 1 hora.</p>
                    <a href="${resetLink}" style="display:inline-block;background:#ea580c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
                        Restablecer contraseña
                    </a>
                    <p style="color:#94a3b8;font-size:12px;">Si no solicitaste esto, ignorá este email.</p>
                </div>
            `
        })
    })
    if (!res.ok) throw new Error(`Resend error: ${res.status}`)
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const usuario = await Usuario.findOne({
            where: { email },
            include: [
                { model: Rol, attributes: ['id', 'nombre'] },
                { model: Negocio, attributes: ['id', 'nombre', 'activo'] }
            ]
        })

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' })
        }

        if (!usuario.activo) {
            return res.status(401).json({ error: 'Usuario desactivado. Contacta al administrador.' })
        }

        // Verificar que el negocio esté activo (solo para no-superadmin)
        if (usuario.rol.nombre !== 'superadmin' && usuario.negocio && !usuario.negocio.activo) {
            return res.status(403).json({ error: 'Tu cuenta está suspendida por falta de pago. Contacta al proveedor del sistema.' })
        }

        const passwordValid = await bcrypt.compare(password, usuario.password_hash)
        if (!passwordValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' })
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol_id: usuario.rol_id,
                rol_nombre: usuario.rol.nombre,
                negocio_id: usuario.negocio_id
            },
            process.env.JWT_SECRET!,
            { expiresIn: '12h' }
        )

        res.json({
            data: {
                token,
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol_id: usuario.rol_id,
                    rol_nombre: usuario.rol.nombre,
                    negocio_id: usuario.negocio_id,
                    negocio_nombre: usuario.negocio?.nombre
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al iniciar sesión' })
    }
}

export const updatePerfil = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id
        const { nombre, password_actual, password_nueva } = req.body

        const usuario = await Usuario.findByPk(userId)
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

        const updateData: any = {}

        if (nombre && nombre.trim()) {
            updateData.nombre = nombre.trim()
        }

        if (password_nueva) {
            if (!password_actual) {
                return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' })
            }
            const valid = await bcrypt.compare(password_actual, usuario.password_hash)
            if (!valid) {
                return res.status(400).json({ error: 'La contraseña actual es incorrecta' })
            }
            updateData.password_hash = await bcrypt.hash(password_nueva, 10)
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No hay cambios para guardar' })
        }

        await usuario.update(updateData)
        res.json({ data: { mensaje: 'Perfil actualizado correctamente' } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al actualizar el perfil' })
    }
}

export const me = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id

        const usuario = await Usuario.findByPk(userId, {
            include: [
                { model: Rol, attributes: ['id', 'nombre'] },
                { model: Negocio, attributes: ['id', 'nombre'] }
            ]
        })

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ error: 'Usuario no encontrado o desactivado' })
        }

        res.json({
            data: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol_id: usuario.rol_id,
                rol_nombre: usuario.rol.nombre,
                negocio_id: usuario.negocio_id,
                negocio_nombre: usuario.negocio?.nombre
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al obtener el usuario' })
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        const usuario = await Usuario.findOne({ where: { email } })

        // Siempre responder igual para no revelar si el email existe
        const respuesta = { data: 'Si el email existe, recibirás un link para restablecer tu contraseña.' }

        if (!usuario || !usuario.activo) return res.json(respuesta)

        const token = crypto.randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

        await usuario.update({ reset_token: token, reset_token_expiry: expiry })

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const resetLink = `${frontendUrl}/reset-password?token=${token}`

        await sendResetEmail(email, resetLink)

        res.json(respuesta)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body

        const usuario = await Usuario.findOne({ where: { reset_token: token } })

        if (!usuario || !usuario.reset_token_expiry) {
            return res.status(400).json({ error: 'El link es inválido o ya fue usado' })
        }

        if (new Date() > usuario.reset_token_expiry) {
            return res.status(400).json({ error: 'El link expiró. Solicitá uno nuevo.' })
        }

        const hash = await bcrypt.hash(password, 10)
        await usuario.update({ password_hash: hash, reset_token: null, reset_token_expiry: null })

        res.json({ data: 'Contraseña actualizada correctamente' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Hubo un error al restablecer la contraseña' })
    }
}
