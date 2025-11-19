import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_fallback';


export interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; role: string; };
}

export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }
         const token = authHeader.split(' ')[1];
    try {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; };
               req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};