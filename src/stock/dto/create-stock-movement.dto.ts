import { IsInt, IsString } from 'class-validator';

export class CreateStockMovementDto {
  @IsInt() shop_id: number;
  @IsInt() batch_id: number;
  @IsInt() quantity: number;

  @IsString() movement_type: 'IN' | 'OUT';
  @IsString() reason: string;
  reference?: string;
}
