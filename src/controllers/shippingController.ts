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

        //  Crear el registro de envío 
        const shipping = await Shipping.create({
            user_id: authenticatedUserId, 
            order_id: order_id, 
            status: 'created', 
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

  static getShippingById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const shipping = await Shipping.findByPk(id, {
        include: [ProductItem, ShippingLog],
      });

      if (!shipping) {
        return res.status(404).json({ error: "Envío no encontrado" });
      }

      res.json(shipping);
    } catch (error) {
      console.error("Error al obtener el envío:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

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
    try {
      const { transport_type, products } = req.body;

      const cost = calculateShippingCost(transport_type, products);

      res.json({ cost });
    } catch (error) {
      console.error("Error al calcular el costo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  static getShippingLogs = async (req: Request, res: Response) => {
    try {
      const { id: shipping_id } = req.params;

      const logs = await ShippingLog.findAll({
        where: { shipping_id },
        order: [["timestamp", "ASC"]],
      });

      res.json(logs);
    } catch (error) {
      console.error("Error al obtener los logs:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
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
