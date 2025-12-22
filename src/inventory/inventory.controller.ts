import { Controller, Post, Body, Param, Patch, Get, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryStatusDto } from './dto/update-inventory-status.dto';
import { CreateMedicineWithBatchDto } from './dto/create-medicine-with-batch.dto';
import { CreateBatchWithStockDto } from './dto/create-batch-with-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Patch('status')
  updateStatus(@Body() dto: UpdateInventoryStatusDto) {
    return this.service.updateMedicineOrBatchStatus(dto);
  }

  // Create Medicine + Batch + Stock
@Post('medicine')
async createMedicine(@Body() body: any) {
  const dto: CreateMedicineWithBatchDto = {
    shop_id: body.shop_id,
    name: body.name,
    category: body.category,
    ndc_code: body.ndc_code,

    batch_no: body.batch_no,
    manufacture_date: body.mfg_date,
    expiry_date: body.exp_date,

    quantity: Number(body.quantity),
    unit: Number(body.unit),

    unit_price: Number(body.purchase_price),
    purchase_price: Number(body.total_cost),
    selling_price: Number(body.selling_price),
    profit: body.profit,

    rack_no: body.rack_no,

    seller_name: body.seller_name,
    seller_phone: body.phone,

    stock_quantity: Number(body.stock),
    reason: 'Initial Stock',
  };

  return this.service.createMedicineWithBatchAndStock(dto);
}


  // Create Batch + Stock for existing medicine
@Post('medicine/:medicineId/batch')
createBatch(
  @Param('medicineId') medicineId: string,
  @Body() body: any,
) {
  const quantity = Number(body.quantity);
  const unit = Number(body.unit);
  const unitPrice = Number(body.purchase_price);

  const totalStock = quantity * unit;
  const totalCost = unitPrice * totalStock;

  const dto: CreateBatchWithStockDto = {
    shop_id: Number(body.shop_id),

    batch_no: body.batch_no,
    manufacture_date: body.mfg_date,
    expiry_date: body.exp_date,

    quantity,
    unit,

    // ✅ YOUR LOGIC (NOW CONSISTENT)
    unit_price: unitPrice,         // price per unit
    purchase_price: totalCost,     // total cost
    selling_price: Number(body.selling_price),

    rack_no: body.rack_no,
    profit:Number(body.profit),

    seller_name: body.seller_name,
    seller_phone: body.seller_phone,

    stock_quantity: totalStock,
    reason: body.reason ?? 'New Batch',
  };

  return this.service.createBatchWithStock(+medicineId, dto);
}



@Get('medicine/:id')
getMedicine(@Param('id') id: string) {
  return this.service.getMedicineWithBatches(+id);
}

@Get('medicine/shop/:shop_id')
getAllMedicines(@Param('shop_id') shop_id: string) {
  return this.service.getAllMedicinesWithBatches(+shop_id);
}

}
