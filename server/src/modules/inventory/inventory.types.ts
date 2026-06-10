export interface AddProductPayload {
  sku: string;
  name: string;
  description?: string;
  productType?: "finished_good" | "service" | "raw_material";
  uom: string;
  salePrice?: number;
  costPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  product_type: "finished_good" | "service" | "raw_material";
  uom: string;
  sale_price: string | null;
  cost_price: string | null;
  min_stock_level: string;
  max_stock_level: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StockMovementPayload {
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
}

export interface LowStockRecord {
  product_id: string;
  sku: string;
  name: string;
  warehouse_id: string;
  warehouse_code: string;
  quantity_on_hand: string;
  min_stock_level: string;
  quantity_gap: string;
}
