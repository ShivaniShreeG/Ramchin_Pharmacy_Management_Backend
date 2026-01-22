// reorder.dto.ts
export class CreateOrderDto {
  supplier_id: number;

  items: {
    medicine_id: number;
    quantity: number;
  }[];
}
