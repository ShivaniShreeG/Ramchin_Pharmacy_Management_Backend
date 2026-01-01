import { IsInt, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMedicineBatchDto {
  @IsInt() shop_id: number;
  @IsInt() medicine_id: number;

  @IsString() batch_no: string;
  expiry_date: Date;
  manufacture_date: Date;

  @IsInt() quantity: number;
  @IsInt() unit: number;

  @IsNumber() unit_price: number;
  @IsNumber() purchase_price_unit: number;
  @IsNumber() selling_price_unit: number;
 @IsNumber() purchase_price_quantity: number;
  @IsNumber() selling_price_quantity: number;
  @IsOptional() single_price?: number;
  @IsOptional() profit?: number;
  @IsOptional() gst?: number;
  @IsOptional() rack_no?: string;

  @IsString() name: string;
  @IsString() phone: string;
}
