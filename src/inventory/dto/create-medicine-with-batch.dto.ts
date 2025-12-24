export class CreateMedicineWithBatchDto {
  // Medicine
  shop_id: number;
  name: string;
  category: string;
  ndc_code?: string;

  // Batch
  batch_no: string;
  manufacture_date: string;
  reorder:number;
  hsncode:string;
  expiry_date: string;
  quantity: number;
  unit: number;
  unit_price: number;       // purchase_price per unit
  purchase_price: number;   // total purchase price
  selling_price: number;
  single_price?: number;
  rack_no?: string;
  gst?: number;
  profit?: number;
  note?: any;

  // Seller
  seller_name: string;
  seller_phone: string;

  // Stock
  stock_quantity: number;
  reason: string;
}
