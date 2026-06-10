import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { InventoryController } from "./inventory.controller";
import { InventoryRepository } from "./inventory.repository";
import { InventoryService } from "./inventory.service";

const repository = new InventoryRepository();
const service = new InventoryService(repository);
const controller = new InventoryController(service);

export const inventoryRouter = Router();

inventoryRouter.post("/products", authMiddleware, controller.addProduct);
inventoryRouter.post("/stock/in", authMiddleware, controller.stockIn);
inventoryRouter.post("/stock/out", authMiddleware, controller.stockOut);
inventoryRouter.get("/alerts/low-stock", authMiddleware, controller.lowStockAlerts);
