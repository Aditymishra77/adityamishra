import { InventoryRepository } from "./inventory.repository";
import type { AddProductPayload, LowStockRecord, ProductRecord, StockMovementPayload } from "./inventory.types";

export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async addProduct(payload: AddProductPayload): Promise<ProductRecord> {
    if (!payload.sku?.trim()) {
      throw new Error("sku is required.");
    }

    if (!payload.name?.trim()) {
      throw new Error("name is required.");
    }

    if (!payload.uom?.trim()) {
      throw new Error("uom is required.");
    }

    return this.repository.addProduct(payload);
  }

  async stockIn(payload: StockMovementPayload, createdBy?: string): Promise<void> {
    this.validateStockPayload(payload);
    await this.repository.stockIn(payload, createdBy);
  }

  async stockOut(payload: StockMovementPayload, createdBy?: string): Promise<void> {
    this.validateStockPayload(payload);
    await this.repository.stockOut(payload, createdBy);
  }

  async getLowStockAlerts(): Promise<LowStockRecord[]> {
    return this.repository.findLowStockProducts();
  }

  private validateStockPayload(payload: StockMovementPayload): void {
    if (!payload.productId) {
      throw new Error("productId is required.");
    }

    if (!payload.warehouseId) {
      throw new Error("warehouseId is required.");
    }

    if (payload.quantity <= 0) {
      throw new Error("quantity must be greater than 0.");
    }
  }
}
