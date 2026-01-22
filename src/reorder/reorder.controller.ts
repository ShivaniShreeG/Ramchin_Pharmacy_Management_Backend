import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { ReorderService } from './reorder.service';
import { CreateOrderDto } from './dto/reorder.dto';

@Controller('reorder')
export class ReorderController {
  constructor(private readonly Service: ReorderService) {}

    @Post('order/:shopId')
  async createOrder(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.Service.createMedicineOrder(shopId, dto);
  }

  @Get(':shopId')
  async getReorderList(
    @Param('shopId', ParseIntPipe) shopId: number,
  ) {
    return this.Service.getReorderMedicinesWithSupplier(shopId);
  }

  @Get('supplier-wise/:shopId')
  async getSupplierWiseReorder(
    @Param('shopId', ParseIntPipe) shopId: number,
  ) {
    return this.Service.getSupplierWiseReorderList(shopId);
  }
  
}
