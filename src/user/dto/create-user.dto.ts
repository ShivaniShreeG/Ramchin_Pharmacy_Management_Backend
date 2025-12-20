import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  shop_id: number;

  @IsString()
  user_id: string;

  @IsString()
  password: string;

  @IsString()
  designation: string; // required

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
