import { postgres } from "../../shared/db/postgres";
import type { AddProductPayload, LowStockRecord, ProductRecord, StockMovementPayload } from "./inventory.types";

export class InventoryRepository {
  async addProduct(payload: AddProductPayload): Promise<ProductRecord> {
    const result = await postgres.query<ProductRecord>(
      `
      INSERT INTO inventory_products (
        sku,
        name,
        description,
        product_type,
        uom,
        sale_price,
        cost_price,
        min_stock_level,
        max_stock_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        payload.sku,
        payload.name,
        payload.description ?? null,
        payload.productType ?? "finished_good",
        payload.uom,
        payload.salePrice ?? null,
        payload.costPrice ?? null,
        payload.minStockLevel ?? 0,
        payload.maxStockLevel ?? null,
      ],
    );

    return result.rows[0];
  }

  async stockIn(payload: StockMovementPayload, createdBy?: string): Promise<void> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        INSERT INTO inventory_stock_levels (product_id, warehouse_id, quantity_on_hand, quantity_reserved)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET quantity_on_hand = inventory_stock_levels.quantity_on_hand + EXCLUDED.quantity_on_hand,
                      updated_at = NOW()
        `,
        [payload.productId, payload.warehouseId, payload.quantity],
      );

      await client.query(
        `
        INSERT INTO inventory_stock_movements (
          movement_type,
          product_id,
          warehouse_id,
          quantity,
          unit_cost,
          reference_type,
          reference_id,
          created_by
        ) VALUES ('inbound', $1, $2, $3, $4, $5, $6, $7)
        `,
        [
          payload.productId,
          payload.warehouseId,
          payload.quantity,
          payload.unitCost ?? null,
          payload.referenceType ?? null,
          payload.referenceId ?? null,
          createdBy ?? null,
        ],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async stockOut(payload: StockMovementPayload, createdBy?: string): Promise<void> {
    const client = await postgres.connect();

    try {
      await client.query("BEGIN");

      const updateResult = await client.query(
        `
        UPDATE inventory_stock_levels
        SET quantity_on_hand = quantity_on_hand - $3,
            updated_at = NOW()
        WHERE product_id = $1
          AND warehouse_id = $2
          AND quantity_on_hand >= $3
        RETURNING id
        `,
        [payload.productId, payload.warehouseId, payload.quantity],
      );

      if (!updateResult.rowCount) {
        throw new Error("Insufficient stock for stock-out request.");
      }

      await client.query(
        `
        INSERT INTO inventory_stock_movements (
          movement_type,
          product_id,
          warehouse_id,
          quantity,
          unit_cost,
          reference_type,
          reference_id,
          created_by
        ) VALUES ('outbound', $1, $2, $3, $4, $5, $6, $7)
        `,
        [
          payload.productId,
          payload.warehouseId,
          payload.quantity,
          payload.unitCost ?? null,
          payload.referenceType ?? null,
          payload.referenceId ?? null,
          createdBy ?? null,
        ],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findLowStockProducts(): Promise<LowStockRecord[]> {
    const result = await postgres.query<LowStockRecord>(
      `
      SELECT
        p.id AS product_id,
        p.sku,
        p.name,
        w.id AS warehouse_id,
        w.code AS warehouse_code,
        sl.quantity_on_hand,
        p.min_stock_level,
        (p.min_stock_level - sl.quantity_on_hand) AS quantity_gap
      FROM inventory_stock_levels sl
      JOIN inventory_products p ON p.id = sl.product_id
      JOIN inventory_warehouses w ON w.id = sl.warehouse_id
      WHERE p.is_active = TRUE
        AND sl.quantity_on_hand < p.min_stock_level
      ORDER BY (p.min_stock_level - sl.quantity_on_hand) DESC
      `,
    );

    return result.rows;
  }
}
