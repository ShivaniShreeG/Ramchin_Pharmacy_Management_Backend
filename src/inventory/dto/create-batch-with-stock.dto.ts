export class CreateBatchWithStockDto {
  shop_id: number;

  batch_no: string;

  manufacture_date: string;
  expiry_date: string;

  quantity: number;
  unit: number;

  unit_price: number;       // price per unit
  purchase_price: number;  // price per pack
  selling_price: number;

  rack_no?: string;
  profit?: number;

  seller_name: string;
  seller_phone: string;

  stock_quantity: number;
  reason: string;
}
