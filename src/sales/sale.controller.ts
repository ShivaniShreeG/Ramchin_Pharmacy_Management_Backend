import { Controller, Get, Param, Query } from '@nestjs/common';
import { SalesService } from './sale.service';

@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get('report/:shopId')
  async getReportByDate(
    @Param('shopId') shopId: number,
    @Query('date') date: string, // Only one date
  ) {
    return this.salesService.getSalesReportByDate(shopId, date);
  }
}
