import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateShippingCost = async (req: Request, res: Response, next: NextFunction) => {
    

    await body('transportMethod')
        .notEmpty().withMessage('El tipo de transporte es obligatorio para la cotización')
        .isIn(['air', 'sea', 'rail', 'road', 'standard', 'express']).withMessage('Tipo de transporte inválido.')
        .run(req);

    await body('products')
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto para cotizar')
        .run(req);
        
    await body('originAddress.postal_code')
        .optional() 
        .isLength({ min: 4, max: 10 }).withMessage('Código postal de origen inválido')
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};