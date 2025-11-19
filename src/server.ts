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
        console.log( colors.red.bold('Fallo en conexión a la BD'))
    }
}



const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/logistics',shippingRouter)
app.use('/api/auth',userRouter)

export default app