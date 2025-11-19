import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import shippingRouter from './routes/shippingRoutes'
import userRouter from './routes/authRouter'

export async function connectDB() {
    try {
        await db.authenticate()
        await db.sync()
        console.log( colors.blue.bold('Conexión exitosa a la BD'))
    } catch (error) {
        console.log(error)
        console.log( colors.red.bold('Fallo en conexión a la BD'))
    }
}



const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Bienvenido al Backend de Logística UTN (API REST)',
        status: 'Operacional',
        version: 'v1',
        contexto: {
            grupo: 'N9',
            materia: 'Desarrollo de Software 2025 - TPI',
            institucion: 'UTN FRRe - Resistencia, Chaco, Argentina',
            integrantes: [
                'Ruiz Diaz Javier A.',
                'Jorge Eduardo Villaverde',
                'Romero Sebastian',
                
            ],
            servicios: {
                autenticacion: '/api/auth/login',
                creacion_envio: '/api/logistics/tracking (POST)',
                consulta_estado: '/api/logistics/tracking/{id} (GET)',
                documentacion_disponible: 'Consultar el archivo OpenAPI'
            }
        }
    });
});

app.use('/api/logistics',shippingRouter)
app.use('/api/auth',userRouter)

export default app