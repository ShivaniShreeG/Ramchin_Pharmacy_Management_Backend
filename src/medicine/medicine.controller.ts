import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';

@Controller('medicine')
export class MedicineController {
  constructor(private service: MedicineService) {}



  @Get('available/shop/:shop_id')
getAllMedicines(@Param('shop_id') shop_id: string) {
  return this.service.getAllMedicinesWithBatches(+shop_id);
}

@Get('by-id/:shop_id/:id')
async getMedicineById(
  @Param('shop_id') shop_id: string,
  @Param('id') id: string
) {
  return this.service.getMedicine(+shop_id, +id);
}


  @Get('low-stock/:shopId')
  async getLowStockMedicines(
    @Param('shopId') shopId: string,
  ) {
    return this.service.getLowStockMedicines(Number(shopId));
  }

@Get('search')
  search(
    @Query('shop_id') shopId: string,
    @Query('query') query: string,
  ) {
    return this.service.searchMedicines(+shopId, query);
  }

  @Get()
  findAll(@Query('shop_id') shop_id: string) {
    return this.service.findAll(+shop_id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto) {
    return this.service.update(+id, dto);
  }

}
