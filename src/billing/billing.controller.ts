import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  BadRequestException,
  ParseIntPipe
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  async createBill(@Body() dto: CreateBillDto) {
    return this.billingService.createBill(dto);
  }

  @Get('history/:shopId')
  async getBillingHistory(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.billingService.getBillingHistory(shopId);
  }
@Get(':shopId/:billId')
  async getBillDetails(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('billId', ParseIntPipe) billId: number,
  ) {
    return this.billingService.getBillDetails(shopId, billId);
  }
 @Get('history/grouped/:shopId')
  async getGroupedBillingHistory(
    @Param('shopId') shopId: string,
  ) {
    return this.billingService.getBillingHistoryGroupedByCustomer(
      Number(shopId),
    );
  }
  
  // ✅ STEP 1: PHONE → CUSTOMER NAMES
  @Get('customers/by-phone/:shopId')
  async getCustomersByPhone(
    @Param('shopId') shopId: string,
    @Query('phone') phone: string,
  ) {
    if (!shopId || !phone) {
      throw new BadRequestException('shopId and phone are required');
    }

    return this.billingService.getCustomerNamesByPhone(
      Number(shopId),
      phone.trim(),
    );
  }

  // ✅ STEP 2: PHONE + NAME → BILL DETAILS
  @Get('bills/by-customer/:shopId')
  async getBillsByCustomer(
    @Param('shopId') shopId: string,
    @Query('phone') phone: string,
    @Query('customerName') customerName: string,
  ) {
    if (!shopId || !phone || !customerName) {
      throw new BadRequestException(
        'shopId, phone and customerName are required',
      );
    }

    return this.billingService.getBillsByCustomer(
      Number(shopId),
      phone.trim(),
      customerName.trim(),
    );
  }
}
