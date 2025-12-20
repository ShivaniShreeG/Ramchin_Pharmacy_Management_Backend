import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateShopDto {
  @IsOptional()
  @IsInt()
  shop_id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  logo?: string; // Base64 string
}
