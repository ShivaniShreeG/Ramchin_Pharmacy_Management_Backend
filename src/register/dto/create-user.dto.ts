import { IsNotEmpty, IsEmail, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateShopAdminDto {
  // Lodge fields
  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @IsString()
  @IsNotEmpty()
  shop_phone: string;

  @IsEmail()
  shop_email: string;

  @IsString()
  @IsNotEmpty()
  shop_address: string;

  @IsOptional()
  @IsString() // You’ll convert to Buffer when saving to Prisma
  shop_logo: string;

  // ✅ Optional lodge_id (for lookups or testing)
  @IsOptional()
  @IsNumber()
  shop_id: number;

  // User fields (used for login)
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // Admin profile fields
  @IsString()
  @IsNotEmpty()
  admin_name: string;

  @IsString()
  @IsNotEmpty()
  admin_phone: string;

  @IsEmail()
  admin_email: string;

}
