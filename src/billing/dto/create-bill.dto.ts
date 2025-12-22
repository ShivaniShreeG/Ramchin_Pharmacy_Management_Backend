import { PaymentMode } from '@prisma/client';

export class BillItemDto {
  medicine_id: number;
  batch_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export class CreateBillDto {
  shop_id: number;
  user_id: string;
  customer_name: string;
  phone: string;
  doctor_name?: string;
  total: number;
  payment_mode: PaymentMode;
  items: BillItemDto[];
}
