export class CreateMedicineWithBatchDto {
  shop_id: number;
  name: string;
  category: string;
  ndc_code?: string;
  reorder?: number;

  batch_no: string;
  manufacture_date: string;
  expiry_date: string;
  hsncode?: string;
  quantity: number;
  free_quantity?: number;
  total_quantity: number;
  unit: number;

  purchase_price_unit: number;
  purchase_price_quantity: number;
  selling_price_unit: number;
  selling_price_quantity: number;
  mrp?: number;
  profit?: number;
  purchase_details?: any;
  rack_no?: string;

  supplier_id?: number;

  stock_quantity: number;
  reason: string;

  seller_name: string; // optional if supplier_id is provided
  seller_phone: string; // optional if supplier_id is provided
}
