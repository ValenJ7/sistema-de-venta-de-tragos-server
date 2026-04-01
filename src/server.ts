import express, { Express } from 'express';
import cors from 'cors';
import colors from 'colors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import db from './config/db';
import router from './routes/router';

async function connectDB() {
    try {
        await db.authenticate();
        await db.sync({ alter: true });
        console.log(colors.blue.bold('Conexión exitosa a la Base de Datos'));
    } catch (error) {
        console.log(colors.red.bold('Hubo un error al conectar a la BD'));
    }
}
connectDB();

const server: Express = express();

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:4173',
            process.env.FRONTEND_URL,
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

server.options('*', cors(corsOptions));
server.use(cors(corsOptions));

server.use(express.json({ limit: '10kb' }));

// 1. Conectar las rutas de la API
server.use('/api', router);

// 2. Conectar la interfaz de Swagger
server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default server;