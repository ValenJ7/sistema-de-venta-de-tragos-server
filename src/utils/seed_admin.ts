import dotenv from 'dotenv'
dotenv.config()

import bcrypt from 'bcryptjs'
import db from '../config/db'
import Rol from '../models/Rol'
import Negocio from '../models/Negocio'
import Usuario from '../models/Usuario'

async function cleanDatabase() {
    // Eliminar en orden para respetar foreign keys
    await db.query('TRUNCATE TABLE venta_detalles RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE ventas RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE sesiones_caja RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE cajas RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE productos RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE categorias RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE negocios RESTART IDENTITY CASCADE')
    await db.query('TRUNCATE TABLE roles RESTART IDENTITY CASCADE')
    console.log('Base de datos limpiada correctamente')
}

async function seedAdmin() {
    try {
        await db.authenticate()
        await db.sync({ alter: true })

        await cleanDatabase()

        // Crear rol superadmin
        const rolSuperAdmin = await Rol.create({ nombre: 'superadmin' })
        await Rol.create({ nombre: 'admin' })
        await Rol.create({ nombre: 'cajero' })
        console.log('Roles creados')

        // Negocio base requerido por el modelo
        const negocio = await Negocio.create({ nombre: 'Sistema', config_moneda: 'ARS', activo: true })
        console.log('Negocio base creado')

        // Crear superadmin
        const passwordHash = await bcrypt.hash('18130646Va,', 10)
        await Usuario.create({
            nombre: 'Super Admin',
            email: 'valentinjuarez733@gmail.com',
            password_hash: passwordHash,
            rol_id: rolSuperAdmin.id,
            negocio_id: negocio.id,
            activo: true
        })

        console.log('\n=============================')
        console.log('SEED COMPLETADO EXITOSAMENTE')
        console.log('=============================')
        console.log('\nCuenta superadmin:')
        console.log('  Email:    valentinjuarez733@gmail.com')
        console.log('  Password: 18130646Va,')

        process.exit(0)
    } catch (error) {
        console.error('Error al ejecutar seed:', error)
        process.exit(1)
    }
}

seedAdmin()
