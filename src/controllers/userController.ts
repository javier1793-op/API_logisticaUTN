import { Request, Response } from 'express';
import User from '../models/User'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_fallback'; 

export class UserController {

    
    static register = async (req: Request, res: Response): Promise<Response> => {
        const { email, password, firstName, lastName } = req.body;
        try {
            
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ message: 'El email ya está registrado.' });
            }
            const hashedPassword = await bcrypt.hash(password, 10); 

            const user = await User.create({
                email,
                password: hashedPassword,
                name: firstName, 
            } as any); 

            return res.status(201).json({ message: 'Usuario registrado exitosamente.', userId: user.id });

        } catch (error) {
            console.error("Error en el registro:", error);
            return res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
        }
    }


   static login = async (req: Request, res: Response): Promise<Response> => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const token = jwt.sign(
                
                { 
                    id: user.id, 
                    email: user.email, 
                    role: 'client' 
                }, 
                JWT_SECRET, 
                { expiresIn: '1h' } 
            );

            return res.status(200).json({ 
                token, 
                user: { id: user.id, email: user.email, name: user.name } 
            });

        } catch (error) {
            console.error("Error en el login:", error);
            return res.status(500).json({ message: 'Error interno del servidor durante el login.' });
        }
    }
}