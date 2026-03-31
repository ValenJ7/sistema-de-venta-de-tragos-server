import db from '../config/db';
import fs from 'fs';

async function run() {
  await db.authenticate();
  
  const [usuariosCols] = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios'`);
  const [cajasCols] = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'cajas'`);
  const [rolesCols] = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'roles'`);
  const [sesionesCols] = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'sesiones_caja'`);
  
  const output = `Usuarios: ${usuariosCols.map((c: any) => c.column_name).join(', ')}
Cajas: ${cajasCols.map((c: any) => c.column_name).join(', ')}
Roles: ${rolesCols.map((c: any) => c.column_name).join(', ')}
Sesiones: ${sesionesCols.map((c: any) => c.column_name).join(', ')}
`;

  fs.writeFileSync('schema_output.txt', output, 'utf-8');
  process.exit(0);
}

run().catch(console.error);
