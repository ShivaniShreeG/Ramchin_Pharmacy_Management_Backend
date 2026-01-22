import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly Service: OrderService) {}

  @Get('received-history/:shopId')
async receivedHistory(@Param('shopId') shopId: string) {
  return this.Service.getReceivedOrdersHistory(Number(shopId));
}

   @Post('receive/:shopId')
  receiveOrders(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body('orders') orders: { order_id: number; medicine_id: number }[],
  ) {
    return this.Service.receiveOrders(shopId, orders);
  }

  // reorder.controller.ts
@Get('ordered/:shopId')
async getOrdered(
  @Param('shopId', ParseIntPipe) shopId: number,
) {
  return this.Service.getOrderedMedicines(shopId);
}

@Get('ordered/supplier-wise/:shopId')
supplierWiseOrdered(
  @Param('shopId', ParseIntPipe) shopId: number,
) {
  return this.Service.getSupplierWiseOrdered(shopId);
}

  
}
