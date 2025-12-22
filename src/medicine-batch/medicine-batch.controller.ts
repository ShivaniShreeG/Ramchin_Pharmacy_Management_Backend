import { Controller, Post, Get, Patch, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { MedicineBatchService } from './medicine-batch.service'; 

@Controller('medicine-batch')
export class MedicineBatchController {
  constructor(private service: MedicineBatchService) {}

  @Post()
  create(@Body() dto) {
    return this.service.create(dto);
  }
@Get('expired/:shopId')
getExpired(@Param('shopId') shopId: string) {
  if (isNaN(+shopId)) {
    throw new BadRequestException('Invalid shopId');
  }
  return this.service.getExpiredMedicineBatches(+shopId);
}

// 🚫 DEACTIVATED MEDICINES (WITH STOCK)
@Get('deactivated/:shopId')
getDeactivated(@Param('shopId') shopId: string) {
  if (isNaN(+shopId)) {
    throw new BadRequestException('Invalid shopId');
  }
  return this.service.getDeactivatedMedicineBatches(+shopId);
}
// medicine-batch.controller.ts
@Patch('remove/:shopId')
removeBatch(
  @Param('shopId') shopId: string,
  @Body() body: { medicine_id: number; batch_id: number },
) {
  return this.service.removeBatch(
    +shopId,
    body.medicine_id,
    body.batch_id,
  );
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
}
