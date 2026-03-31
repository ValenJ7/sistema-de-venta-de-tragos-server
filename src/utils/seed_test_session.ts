import db from '../config/db';

async function executeQueries() {
  await db.authenticate();
  
  const tables = [
    { name: 'Negocio', sql: `INSERT INTO negocios (id, nombre, "createdAt", "updatedAt") VALUES (1, 'Mi Bar', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;` },
    { name: 'Rol', sql: `INSERT INTO roles (id, nombre) VALUES (1, 'Admin') ON CONFLICT (id) DO NOTHING;` },
    { name: 'Usuario', sql: `INSERT INTO usuarios (id, nombre, email, password_hash, rol_id, negocio_id, "createdAt", "updatedAt") VALUES (1, 'Admin', 'admin@bar.com', '123456', 1, 1, NOW(), NOW()) ON CONFLICT (email) DO NOTHING;` },
    { name: 'Caja', sql: `INSERT INTO cajas (id, nombre, negocio_id, "createdAt", "updatedAt") VALUES (1, 'Caja Principal', 1, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;` },
    { name: 'Sesion', sql: `INSERT INTO sesiones_caja (id, caja_id, usuario_id, monto_inicial, apertura_fecha, "createdAt", "updatedAt") VALUES (1, 1, 1, 0, NOW(), NOW(), NOW()) ON CONFLICT (id) DO NOTHING;` }
  ];

  for (const table of tables) {
    try {
      console.log(`Intentando insertar ${table.name}...`);
      await db.query(table.sql);
      console.log(`✅ ${table.name} insertado / existía.`);
    } catch (e: any) {
      console.error(`❌ Error en ${table.name}: ${e.message}`);
      process.exit(1);
    }
  }

  console.log("================================");
  console.log("✅ SESION TEST LISTA EN DB. ID: 1");
  console.log("================================");
  process.exit(0);
}

executeQueries();
