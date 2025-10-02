import { Router } from "express";
import { ShippingController } from "../controllers/shippingController";
import { validateShippingInput } from "../middlewares/validateShippingInput";

const router = Router();

router.post("/", ShippingController.createShipping);
router.get("/statuses", ShippingController.getShippingStatuses);
router.patch("/:id/status", ShippingController.updateShippingStatus);
router.get("/:id", ShippingController.getShippingById);
router.get("/users/:id/", ShippingController.getShippingsByUser);
router.post("/cost", validateShippingInput, ShippingController.calculateCost);
router.get("/:id/logs", ShippingController.getShippingLogs);

export default router;
