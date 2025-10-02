import { Request, Response } from 'express';
import User from '../models/User';
import Address from '../models/Address';

export class UserController {
  static createUser = async (req: Request, res: Response) => {
    try {
      const { addresses, ...userData } = req.body;

      const user = await User.create(userData);

      if (addresses && Array.isArray(addresses)) {
        await Promise.all(
          addresses.map((addr) =>
            Address.create({
              ...addr,
              user_id: user.id,
            })
          )
        );
      }

      res.status(201).json({ message: 'Usuario creado correctamente', user_id: user.id });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Hubo un error al crear el usuario' });
    }
  };

 
}