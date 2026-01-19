import { IsOptional, IsString, IsDate } from 'class-validator';

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logo?: string; // Base64 string

  @IsOptional()
  @IsDate()
  duedate?: Date; // Match Prisma field name exactly

   @IsOptional()
  @IsString()
  gst_number?: string;

  @IsOptional()
  @IsString()
  dl_number?: string;

  @IsOptional()
  @IsString()
  tin_number?: string;
}
