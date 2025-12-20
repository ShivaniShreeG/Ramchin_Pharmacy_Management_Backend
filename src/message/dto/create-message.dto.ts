import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  shop_id: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
