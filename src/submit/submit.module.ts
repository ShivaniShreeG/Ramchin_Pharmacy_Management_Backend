import { Module } from '@nestjs/common';
import { SubmitTicketService } from './submit.service';
import { SubmitTicketController } from './submit.controller';

@Module({
  controllers: [SubmitTicketController],
  providers: [SubmitTicketService],
})
export class SubmitTicketModule {}
