import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { AppPaymentService } from './app-payment.service';
import { AppPaymentStatus } from '@prisma/client';

@Controller('api/app-payment')
export class AppPaymentController {
  constructor(private readonly appPaymentService: AppPaymentService) {}

  // ✅ Create yearly payment
  @Post('create/:shopId')
  async createPayment(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body('transactionId') transactionId?: string,
  ) {
    return this.appPaymentService.createYearlyPayment(shopId, transactionId);
  }

  // ✅ Update payment status
  @Post('update-status/:paymentId')
  async updateStatus(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() body: { status: AppPaymentStatus; transactionId?: string },
  ) {
    return this.appPaymentService.updatePaymentStatus(
      paymentId,
      body.status,
      body.transactionId,
    );
  }

  // ✅ Get current/latest payment
  @Get('current/:shopId')
  async getCurrentPayment(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.appPaymentService.getCurrentPayment(shopId);
  }

  // ✅ Get payment history
  @Get('history/:shopId')
  async getPaymentHistory(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.appPaymentService.getPaymentHistory(shopId);
  }

  // ✅ Expire old payments manually
  @Post('expire')
  async expireOldPayments() {
    return this.appPaymentService.expireOldPayments();
  }
}
