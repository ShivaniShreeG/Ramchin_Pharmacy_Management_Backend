import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('current-balance/:shopId')
  async getFinanceSummary(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.homeService.getFinanceSummary(shopId);
  }
@Get('totals/:shopId')
  async getTotals(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('date') date?: string,
  ) {
    return this.homeService.getTotals(shopId, date);
  }
}
