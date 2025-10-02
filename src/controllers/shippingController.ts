import type { Request, Response } from "express";
import Shipping from "../models/shippings";
import ShippingLog from "../models/ShippingLog";
import ProductItem from "../models/ProductItem";
import { calculateShippingCost } from "../utils/calculateShippingCost";

export class ShippingController {
  static createShipping = async (req: Request, res: Response) => {
    try {
      const {
        user_id,
        transport_type,
        departure_postal_code,
        estimated_delivery_at,
        products,
      } = req.body;

      const shipping = await Shipping.create({
        user_id,
        transport_type,
        departure_postal_code,
        estimated_delivery_at,
        status: "created",
      });

      await Promise.all(
        products.map((item) =>
          ProductItem.create({
            ...item,
            shipping_id: shipping.id,
          })
        )
      );

      await ShippingLog.create({
        shipping_id: shipping.id,
        timestamp: new Date(),
        status: "created",
        message: "Envío creado exitosamente",
      });

      return res.status(201).json({ shipping_id: shipping.id });
    } catch (error) {
      console.error("Error al crear el envío:", error);
      const err = new Error("Hubo un error");
      return res.status(500).json({ error: err.message });
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
