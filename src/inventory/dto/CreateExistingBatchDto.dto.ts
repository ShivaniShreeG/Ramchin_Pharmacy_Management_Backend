export interface CreateExistingBatchDto {
  shop_id: number;

  batch_no: string;
  mfg_date: string;
  exp_date: string;

  rack_no?: string;

  total_quantity: number;
  unit: number;
  total_stock: number;

  selling_price_per_unit: number;
  selling_price_per_quantity: number;

  reason?: string;
}
