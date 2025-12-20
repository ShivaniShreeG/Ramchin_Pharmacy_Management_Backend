// dto/update-submit-ticket.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubmitTicketDto {
  @IsOptional()
  @IsString()
  issue?: string;
}
