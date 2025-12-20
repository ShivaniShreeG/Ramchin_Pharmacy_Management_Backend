// dto/create-submit-ticket.dto.ts
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateSubmitTicketDto {
  @IsInt()
  shop_id: number;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  issue: string;
}
