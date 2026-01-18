import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MedicineValueService } from './medicine-value.service';

@Controller('medicine-value')
export class MedicineValueController {
  constructor(private readonly medicineValueService: MedicineValueService) {}

 @Get('stock-summary/:shopId')
  getDailyStockSummary(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('date') date?: string,
  ) {
    const summaryDate =
      date || new Date().toISOString().split('T')[0]; // default today

    return this.medicineValueService.getDailyStockSummary(
      shopId,
      summaryDate,
    );
  }
  
  // Overall
  @Get('overall/:shopId')
  getOverall(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.medicineValueService.getOverallValue(shopId);
  }

  // Medicine-wise
  @Get('medicine-wise/:shopId')
  getMedicineWise(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.medicineValueService.getMedicineWiseValue(shopId);
  }

  // Batch-wise
  @Get('batch-wise/:shopId')
  getBatchWise(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.medicineValueService.getBatchWiseValue(shopId);
  }
}
