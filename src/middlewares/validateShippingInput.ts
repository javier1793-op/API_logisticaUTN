import { body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateShippingInput = async (req: Request, res: Response, next: NextFunction) => {
  await body('user_id')
    .notEmpty().withMessage('El usuario es obligatorio')
    .isInt({ gt: 0 }).withMessage('ID de usuario inválido')
    .run(req);

  await body('transport_type')
    .notEmpty().withMessage('El tipo de transporte es obligatorio')
    .isIn(['air', 'sea', 'rail', 'road']).withMessage('Tipo de transporte inválido')
    .run(req);

  await body('departure_postal_code')
    .notEmpty().withMessage('El código postal es obligatorio')
    .isLength({ min: 4, max: 10 }).withMessage('Código postal inválido')
    .run(req);

  await body('estimated_delivery_at')
    .notEmpty().withMessage('La fecha estimada es obligatoria')
    .isISO8601().withMessage('Fecha inválida')
    .run(req);

  await body('products')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto')
    .run(req);

  next();
};