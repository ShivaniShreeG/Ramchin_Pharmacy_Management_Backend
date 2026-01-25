export class CreateExistingMedicineDto {
  shop_id: number;
  name: string;
  category: string;
  ndc_code?: string;
  batch_no: string;

  mfg_date?: string; // ISO string
  exp_date?: string;

  rack_no?: string;

  total_quantity: number;
  unit: number;              // 🔥 FIXED
  total_stock: number;       // 🔥 FIXED

  reorder?: number;
  selling_price_per_unit?: number;
  selling_price_per_quantity?: number;
}
