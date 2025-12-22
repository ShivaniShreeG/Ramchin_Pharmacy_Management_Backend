import { IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateMedicineDto {
  @IsInt()
  shop_id: number;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  ndc_code?: string;
}
