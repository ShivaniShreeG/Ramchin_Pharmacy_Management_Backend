import { Controller, Post, Body, Param, Patch, Get, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryStatusDto } from './dto/update-inventory-status.dto';
import { CreateMedicineWithBatchDto } from './dto/create-medicine-with-batch.dto';
import { CreateBatchWithStockDto } from './dto/create-batch-with-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get('history/:shop_id')
getAllMedicineHistory(
  @Param('shop_id', ParseIntPipe) shop_id: number,
) {
  return this.service.getMedicineStockHistory(shop_id);
}

  @Patch('status')
  updateStatus(@Body() dto: UpdateInventoryStatusDto) {
    return this.service.updateMedicineOrBatchStatus(dto);
  }

  @Get('medicine/:shopId/:medicineId/validate-batch')
  async validateBatchNo(
    @Param('shopId') shopId: string,
    @Param('medicineId') medicineId: string,
    @Query('batch_no') batchNo: string,
  ) {
    if (!shopId || !medicineId || !batchNo) {
      throw new BadRequestException(
        'shopId, medicineId and batch_no are required',
      );
    }

    const exists = await this.service.checkBatchExists(
      Number(shopId),
      Number(medicineId),
      batchNo.trim(),
    );

    return {
      is_valid: !exists, // ✅ frontend expects this
    };
  }

  @Get('medicine/check-name/:shopId')
  async checkMedicineName(
    @Param('shopId') shopId: string,
    @Query('name') name: string,
  ) {
    if (!shopId || !name) {
      return { exists: false, message: 'shop_id and name are required' };
    }
    const exists = await this.service.isMedicineNameTaken(
      Number(shopId),
      name,
    );

    return { exists };
  }
  // Create Medicine + Batch + Stock
@Post('medicine')
async createMedicine(@Body() body: any) {
  const dto: CreateMedicineWithBatchDto = {
    shop_id: body.shop_id,
    name: body.name,
    category: body.category,
    ndc_code: body.ndc_code,
    reorder: body.reorder,
    batch_no: body.batch_no,
    manufacture_date: body.mfg_date,
    expiry_date: body.exp_date,
    hsncode: body.hsncode,
    quantity: Number(body.quantity),
    free_quantity: Number(body.free_quantity || 0),
    total_quantity: Number(body.total_quantity),
    unit: Number(body.unit),
    purchase_price_unit: Number(body.purchasePerUnit),
    purchase_price_quantity: Number(body.purchasePerQuantity),
    selling_price_unit: Number(body.sellingPerUnit),
    selling_price_quantity: Number(body.sellingPerQuantity),
    mrp: Number(body.mrp),
    profit: Number(body.profit),
    purchase_details: body.purchase_details,
    rack_no: body.rack_no,
    supplier_id: body.selectedSupplierId,
    stock_quantity: Number(body.total_stock),
    reason: 'Initial Stock',
    seller_name: body.seller_name || '',
    seller_phone: body.phone || '',
  };

  return this.service.createMedicineWithBatchAndStock(dto);
}


  // Create Batch + Stock for existing medicine
@Post('medicine/:medicineId/batch')
createBatch(
  @Param('medicineId') medicineId: string,
  @Body() body: any,
) {

  const dto: CreateBatchWithStockDto = {
    shop_id: Number(body.shop_id),
batch_no: body.batch_no,
    manufacture_date: body.mfg_date,
    expiry_date: body.exp_date,
    hsncode: body.hsncode,
    quantity: Number(body.quantity),
    free_quantity: Number(body.free_quantity || 0),
    total_quantity: Number(body.total_quantity),
    unit: Number(body.unit),
    purchase_price_unit: Number(body.purchasePerUnit),
    purchase_price_quantity: Number(body.purchasePerQuantity),
    selling_price_unit: Number(body.sellingPerUnit),
    selling_price_quantity: Number(body.sellingPerQuantity),
    mrp: Number(body.mrp),
    profit: Number(body.profit),
    purchase_details: body.purchase_details,
    rack_no: body.rack_no,
    supplier_id: body.selectedSupplierId,
     stock_quantity: Number(body.total_stock), // ✅ Fixed: removed duplicate
    reason: body.reason ?? 'New Batch', // ✅ Fixed: removed duplicate
    seller_name: body.seller_name || '',
    seller_phone: body.phone || '',
   
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
