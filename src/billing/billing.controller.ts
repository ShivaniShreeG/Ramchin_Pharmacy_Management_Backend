import { Controller, Post, Body } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  async createBill(@Body() dto: CreateBillDto) {
    return this.billingService.createBill(dto);
  }
}
