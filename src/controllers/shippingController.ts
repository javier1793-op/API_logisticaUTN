import type { Request, Response } from "express";
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { calculateShippingCost } from "../utils/calculateShippingCost";
import { calculateDeliveryDate, fetchDetailedProducts, mapTransportTypeToEnum } from "../utils/shippingHelpers";
import Shipping from "../models/shippings";
import ShippingLog from "../models/ShippingLog";
import ProductItem from "../models/ProductItem";


export class ShippingController {
  
static createShipping = async (req: AuthenticatedRequest, res: Response) => {
    
    const DEFAULT_DEPARTURE_CP = 'C1000AAA'; 
    const authenticatedUserId = req.user?.id; 

     const { 
        order_id, 
        user_id, 
        delivery_address, 
        transport_type, 
        products 
    } = req.body;

    const t = await Shipping.sequelize.transaction(); 

    try {
        // Validación de Seguridad 
        if (!authenticatedUserId || authenticatedUserId !== user_id) {
            await t.rollback();
            return res.status(403).json({ success: false, message: 'Acceso denegado. ID de usuario no coincide.' });
        }
    
        //  Integración 
        const detailedProducts = await fetchDetailedProducts(products); 
        const transportTypeEnum = mapTransportTypeToEnum(transport_type); 
        const estimatedDeliveryAt = calculateDeliveryDate(transport_type);
        const finalShippingCost = calculateShippingCost(detailedProducts);

        //  Crear el registro de envío 
        const shipping = await Shipping.create({
            user_id: authenticatedUserId, 
            order_id: order_id, 
            status: 'created', 
            shipping_cost: finalShippingCost,
            products: detailedProducts, 

            delivery_address_json: delivery_address, 

            transport_type: transportTypeEnum,
            departure_postal_code: DEFAULT_DEPARTURE_CP,
            estimated_delivery_at: estimatedDeliveryAt,
        }, { transaction: t });

        //  Crear el primer log de seguimiento
        await ShippingLog.create({
            shipping_id: shipping.id,
            status: 'created',
            message: 'Envío creado y pendiente de recolección.',
            timestamp: new Date(), 
        }, { transaction: t });
        
        await t.commit(); 

        return res.status(201).json({ 
            success: true, 
            message: 'Envío registrado exitosamente.',
            data: { shipping_id: shipping.id }
        });

    } catch (error: any) {
        await t.rollback(); 
        console.error('Error en createShipping:', error);

        const errorMessage = error.errors ? error.errors.map((e: any) => e.message).join(', ') : (error.message.includes('Stock') ? error.message : 'Error interno al procesar el envío.');

        return res.status(500).json({ 
            success: false, 
            message: 'Falló la creación del envío o la reserva de stock.', 
            error: errorMessage 
        });
    }
};

  static getShippingById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const authenticatedUserId = req.user?.id;  

        const shipping = await Shipping.findByPk(id, {
            
            include: [
                { 
                    model: ShippingLog, 
                    as: 'logs', 
                    order: [['createdAt', 'ASC']] 
                }
            ]
        });

        if (!shipping) {
           
            return res.status(404).json({ success: false, message: 'Envío no encontrado.' });
        }
       
        return res.status(200).json({ success: true, data: shipping });

    } catch (error) {
        console.error("Error al obtener el envío:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor al obtener el detalle." });
    }
}

  static getShippingsByUser = async (req: Request, res: Response) => {
    try {
      const { id: user_id } = req.params;

      const shippings = await Shipping.findAll({
        where: { user_id },
        include: [ProductItem, ShippingLog],
        order: [["createdAt", "DESC"]],
      });

      res.json(shippings);
    } catch (error) {
      console.error("Error al obtener los envíos del usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  static calculateCost = async (req: Request, res: Response) => {
   
  };

  static getShippingStatuses = (req: Request, res: Response) => {
    try {
      const statuses = [
        "created",
        "distribution",
        "in_transit",
        "delivered",
        "returned",
        "cancelled",
      ];

      res.json({ statuses });
    } catch (error) {
      console.error("Error en getShippingStatuses:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  static updateShippingStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      const validStatuses = [
        "created",
        "distribution",
        "in_transit",
        "delivered",
        "returned",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      const shipping = await Shipping.findByPk(id);
      if (!shipping)
        return res.status(404).json({ error: "Envío no encontrado" });

      shipping.status = status;
      await shipping.save();

      await ShippingLog.create({
        shipping_id: shipping.id,
        status,
        message: message || `Estado actualizado a ${status}`,
        timestamp: new Date(),
      });

      res.json({ message: "Estado actualizado correctamente", status });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
