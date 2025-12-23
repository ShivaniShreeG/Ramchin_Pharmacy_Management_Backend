import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe,BadRequestException } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('income')
  async createIncome(@Body() body: { shop_id: number; user_id: string; reason: string; amount: number; state?: string }) {
    return this.financeService.createIncomeFinance(body);
  }
@Post('expense')
  async createExpenseFinance(@Body() body: { shop_id: number; user_id: string; reason: string; amount: number; state?: string }) {
    return this.financeService.createExpenseFinance(body);
  }

 @Post('drawing')
  async createDrawingFinance(
    @Body()
    body: {
      shop_id: number;
      user_id: string;
      reason: string;
      amount: number;
      state?: string;
      type: 'IN' | 'OUT'; // ✅ restricted
    },
  ) {
    // 🔒 extra safety
    if (!['IN', 'OUT'].includes(body.type)) {
      throw new BadRequestException('Invalid drawing type. Use IN or OUT');
    }

    return this.financeService.createDrawingFinance(body);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.getFinanceById(id);
  }

  @Get('expense/:shopId')
async getExpenses(@Param('shopId', ParseIntPipe) shopId: number) {
  return this.financeService.getExpenseFinances(shopId);
}
  @Get('income/:shopId')
async getIncome(@Param('shopId', ParseIntPipe) shopId: number) {
  return this.financeService.getIncomeFinances(shopId);
}

 @Get('drawing/:shopId')
async getDrawing(@Param('shopId', ParseIntPipe) shopId: number) {
  return this.financeService.getDrawingFinances(shopId);
}

@Get('shop/:shop_id')
  async getAll(@Param('shop_id', ParseIntPipe) shop_id: number) {
    return this.financeService.getAllFinances(shop_id);
  }

  @Get('income/other/:shop_id')
  async getIncomeOther(@Param('shop_id', ParseIntPipe) shop_id: number) {
    return this.financeService.getIncomeOtherFinances(shop_id);
  }

  @Patch(':id')
  async updateSafe(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ reason: string; amount: number }>
  ) {
    return this.financeService.updateFinanceSafe(id, body);
  }

  // ----------------- DELETE -----------------
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.deleteFinance(id);
  }
}
