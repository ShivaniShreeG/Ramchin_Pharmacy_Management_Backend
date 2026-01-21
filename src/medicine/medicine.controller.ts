import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';

@Controller('medicine')
export class MedicineController {
  constructor(private service: MedicineService) {}

  @Get('categories/shop/:shop_id')
getExtraCategories(@Param('shop_id') shop_id: string) {
  return this.service.getExtraCategories(+shop_id);
}

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
  @Post()
  create(@Body() dto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('shop_id') shop_id: string) {
    return this.service.findAll(+shop_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
