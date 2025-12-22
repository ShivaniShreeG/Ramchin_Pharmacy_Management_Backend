// dto/update-inventory-status.dto.ts
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateInventoryStatusDto {
  @IsInt()
  shop_id: number;

  @IsInt()
  medicine_id: number;

  @IsOptional()
  @IsInt()
  batch_id?: number;

  @IsBoolean()
  is_active: boolean;
}
