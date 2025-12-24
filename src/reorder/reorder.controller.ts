import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReorderService } from './reorder.service';

@Controller('reorder')
export class ReorderController {
  constructor(private readonly Service: ReorderService) {}

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
