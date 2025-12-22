import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service'; 

@Controller('stock-movement')
export class StockMovementController {
  constructor(private service: StockMovementService) {}

  @Post()
  create(@Body() dto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('shop_id') shop_id: string) {
    return this.service.findAll(+shop_id);
  }
}
