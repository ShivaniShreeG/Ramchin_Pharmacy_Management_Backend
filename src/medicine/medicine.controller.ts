import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MedicineService } from './medicine.service';

@Controller('medicine')
export class MedicineController {
  constructor(private service: MedicineService) {}

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
