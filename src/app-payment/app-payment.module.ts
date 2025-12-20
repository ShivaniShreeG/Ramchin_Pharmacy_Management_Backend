import { Module } from '@nestjs/common';
import { AppPaymentService } from './app-payment.service';
import { AppPaymentController } from './app-payment.controller';

@Module({
  controllers: [AppPaymentController],
  providers: [AppPaymentService],
})
export class AppPaymentModule {}
