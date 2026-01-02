export class CreateMedicineWithBatchDto {
  shop_id: number;
  name: string;
  category: string;

  ndc_code?: string;
  hsncode?: string;
  rack_no?: string;

  batch_no: string;
  manufacture_date: string;
  expiry_date: string;

  quantity: number;
  free_quantity?: number;
  total_quantity: number;
  unit: number;
  total_stock: number;

  reorder?: number;

  supplier_id?: number;
  purchase_price_unit: number;
  purchase_price_quantity: number;
  selling_price_unit: number;
  selling_price_quantity: number;

  profit?: number;
  mrp?: number;

  purchase_details?: {
    purchase_date: string;
    rate_per_quantity: number;
    gst_percent: number;
    gst_per_quantity: number;
    base_amount: number;
    total_gst_amount: number;
    purchase_price: number;
  };

  reason: string;
}
