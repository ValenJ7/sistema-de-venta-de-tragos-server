import dotenv from 'dotenv'
dotenv.config()

import bcrypt from 'bcryptjs'
import db from '../config/db'
import Rol from '../models/Rol'
import Negocio from '../models/Negocio'
import Usuario from '../models/Usuario'
import Caja from '../models/Caja'
import Categoria from '../models/Categoria'
import Producto from '../models/Producto'

async function resetSequences() {
    const tables = ['roles', 'negocios', 'usuarios', 'cajas', 'sesiones_caja', 'ventas', 'venta_detalles', 'categorias', 'productos']
    for (const table of tables) {
        try {
            await db.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`)
        } catch (e) {
            // Ignorar si la tabla no existe
        }
    }
}

async function migrateNegocioId() {
    // Asegurar que existe al menos un negocio antes de agregar NOT NULL
    const [negocios] = await db.query(`SELECT id FROM negocios LIMIT 1`) as any[]
    let negocioId: number

    if (negocios.length === 0) {
        const [result] = await db.query(`INSERT INTO negocios (nombre, config_moneda) VALUES ('Mi Bar', 'ARS') RETURNING id`) as any[]
        negocioId = result[0].id
    } else {
        negocioId = negocios[0].id
    }

    // Para cada tabla, agregar negocio_id como nullable si no existe, llenar datos, luego hacer NOT NULL
    for (const table of ['categorias', 'productos']) {
        const [cols] = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'negocio_id'`) as any[]
        if (cols.length === 0) {
            await db.query(`ALTER TABLE "${table}" ADD COLUMN negocio_id INTEGER REFERENCES negocios(id)`)
            console.log(`Columna negocio_id agregada a ${table}`)
        }
        await db.query(`UPDATE "${table}" SET negocio_id = ${negocioId} WHERE negocio_id IS NULL`)
        // Hacer NOT NULL si no lo es
        try {
            await db.query(`ALTER TABLE "${table}" ALTER COLUMN negocio_id SET NOT NULL`)
        } catch (e) {
            // Ya es NOT NULL
        }
    }
    console.log('Migración de negocio_id completada')
}

async function seedAdmin() {
    try {
        await db.authenticate()

        // Migrar negocio_id ANTES del sync para evitar error de NOT NULL con datos existentes
        await migrateNegocioId()

        await db.sync({ alter: true })
        await resetSequences()

        // 1. Roles: superadmin, admin, cajero
        let rolSuperAdmin = await Rol.findOne({ where: { nombre: 'superadmin' } })
        if (!rolSuperAdmin) {
            rolSuperAdmin = await Rol.create({ nombre: 'superadmin' })
        }

        let rolAdmin = await Rol.findOne({ where: { nombre: 'admin' } })
        if (!rolAdmin) {
            rolAdmin = await Rol.create({ nombre: 'admin' })
        }

        let rolCajero = await Rol.findOne({ where: { nombre: 'cajero' } })
        if (!rolCajero) {
            rolCajero = await Rol.create({ nombre: 'cajero' })
        }

        console.log(`Rol superadmin ID: ${rolSuperAdmin.id}`)
        console.log(`Rol admin ID: ${rolAdmin.id}`)
        console.log(`Rol cajero ID: ${rolCajero.id}`)

        // 2. Crear superadmin (sin negocio — acceso global)
        const existingSuperAdmin = await Usuario.findOne({ where: { email: 'super@cocktail.com' } })
        const superHash = await bcrypt.hash('super123', 10)

        if (!existingSuperAdmin) {
            await Usuario.create({
                nombre: 'Super Admin',
                email: 'super@cocktail.com',
                password_hash: superHash,
                rol_id: rolSuperAdmin.id,
                negocio_id: 1, // necesita un negocio por el modelo, usamos el primero
                activo: true
            })
            console.log('\n--- SUPERADMIN CREADO ---')
        } else {
            await existingSuperAdmin.update({ password_hash: superHash, rol_id: rolSuperAdmin.id })
            console.log('\n--- SUPERADMIN ACTUALIZADO ---')
        }
        console.log('Email: super@cocktail.com')
        console.log('Password: super123')

        // 3. Negocio demo
        let negocio = await Negocio.findOne()
        if (!negocio) {
            negocio = await Negocio.create({ nombre: 'Mi Bar', config_moneda: 'ARS', activo: true })
        } else {
            await negocio.update({ activo: true })
        }
        console.log(`\nNegocio: ${negocio.nombre} (ID: ${negocio.id})`)

        // 4. Admin del negocio
        const existingAdmin = await Usuario.findOne({ where: { email: 'admin@cocktail.com' } })
        const adminHash = await bcrypt.hash('admin123', 10)

        if (!existingAdmin) {
            await Usuario.create({
                nombre: 'Administrador',
                email: 'admin@cocktail.com',
                password_hash: adminHash,
                rol_id: rolAdmin.id,
                negocio_id: negocio.id,
                activo: true
            })
            console.log('\n--- ADMIN CREADO ---')
        } else {
            await existingAdmin.update({ password_hash: adminHash, rol_id: rolAdmin.id })
            console.log('\n--- ADMIN ACTUALIZADO ---')
        }
        console.log('Email: admin@cocktail.com')
        console.log('Password: admin123')

        // 5. Cajero demo
        const existingCajero = await Usuario.findOne({ where: { email: 'cajero@cocktail.com' } })
        const cajeroHash = await bcrypt.hash('cajero123', 10)

        if (!existingCajero) {
            await Usuario.create({
                nombre: 'Cajero Demo',
                email: 'cajero@cocktail.com',
                password_hash: cajeroHash,
                rol_id: rolCajero.id,
                negocio_id: negocio.id,
                activo: true
            })
            console.log('\n--- CAJERO CREADO ---')
        } else {
            await existingCajero.update({ password_hash: cajeroHash, rol_id: rolCajero.id })
            console.log('\n--- CAJERO ACTUALIZADO ---')
        }
        console.log('Email: cajero@cocktail.com')
        console.log('Password: cajero123')

        // 6. Asegurar cajas con negocio_id
        const cajasCount = await Caja.count()
        if (cajasCount < 2) {
            const falta = 2 - cajasCount
            for (let i = cajasCount + 1; i <= 2; i++) {
                await Caja.create({ nombre: `Caja ${i}`, estado: 'CERRADA', negocio_id: negocio.id })
            }
            console.log(`\n${falta} caja(s) creada(s)`)
        }

        // 7. Migrar datos existentes: asignar negocio_id donde falte
        await db.query(`UPDATE categorias SET negocio_id = ${negocio.id} WHERE negocio_id IS NULL`)
        await db.query(`UPDATE productos SET negocio_id = ${negocio.id} WHERE negocio_id IS NULL`)
        await db.query(`UPDATE cajas SET negocio_id = ${negocio.id} WHERE negocio_id IS NULL`)
        console.log('\nDatos existentes migrados con negocio_id')

        // Reactivar todos los negocios suspendidos
        await db.query(`UPDATE negocios SET activo = true WHERE activo = false`)
        console.log('\nTodos los negocios reactivados')

        await resetSequences()

        console.log('\n=============================')
        console.log('SEED COMPLETADO EXITOSAMENTE')
        console.log('=============================')
        console.log('\nCredenciales:')
        console.log('  SuperAdmin: super@cocktail.com / super123')
        console.log('  Admin:      admin@cocktail.com / admin123')
        console.log('  Cajero:     cajero@cocktail.com / cajero123')

        process.exit(0)
    } catch (error) {
        console.error('Error al crear seed:', error)
        process.exit(1)
    }
}

seedAdmin()
