import { Router } from "express";
import { ShippingController } from "../controllers/shippingController";
import { validateShippingCost } from "../middlewares/validateShippingInput";
import { isAuthenticated } from "../middlewares/authMiddleware"

const router = Router();

// RUTAS PROTEGIDAS (Requieren Token JWT)
// 1. CREAR TRACKING
router.post("/tracking", isAuthenticated,ShippingController.createShipping);
// 2. OBTENER TRACKING ESPECÍFICO
router.get("/tracking/:id", isAuthenticated, ShippingController.getShippingById);
// 3. ACTUALIZAR ESTADO
router.patch("/:id/status", isAuthenticated, ShippingController.updateShippingStatus);
// 4. LISTAR POR USUARIO
router.get("/users/:id/", isAuthenticated, ShippingController.getShippingsByUser);

// RUTAS PÚBLICAS O DE BAJO RIESGO (No requieren Token)
// 5. COTIZACIÓN
router.post("/cost", validateShippingCost, ShippingController.calculateCost);
// 6. LISTADO DE ESTADOS VÁLIDOS
router.get("/statuses", ShippingController.getShippingStatuses);


export default router;
