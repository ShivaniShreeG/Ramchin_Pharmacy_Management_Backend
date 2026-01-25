import { Controller, Post, Body, Param, Patch, Get, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryStatusDto } from './dto/update-inventory-status.dto';
import { CreateMedicineWithBatchDto } from './dto/create-medicine-with-batch.dto';
import { CreateBatchWithStockDto } from './dto/create-batch-with-stock.dto';
import { CreateExistingMedicineDto } from './dto/exist-medicine.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  
@Post('medicine/existing-med')
  async createExisting(@Body() body: CreateExistingMedicineDto) {
    return this.service.createExistingMedicine(body);
  }

    @Get('medicine/categories/:shop_id')
getExtraCategories(@Param('shop_id') shop_id: string) {
  return this.service.getExtraCategories(+shop_id);
}

  @Post('medicine/batch-upload')
async bulkBatchUpload(@Body() body: any) {
  const shopId = Number(body.shop_id);
  const batches = body.batches ?? [];

  return this.service.createBulkBatchWithStock(shopId, batches);
}

@Post('medicine/medicine-upload')
async bulkMedicineUpload(@Body() body: any) {
  const shopId = Number(body.shop_id);
  const batches = body.batches ?? [];

  return this.service.createBulkMedicineWithBatchAndStock(shopId, batches);
}

@Post('medicine')
async createMedicine(@Body() body: any) {
  const dto: CreateMedicineWithBatchDto = {
    shop_id: Number(body.shop_id),
    name: body.name,
    category: body.category,

    ndc_code: body.ndc_code,
    reorder: body.reorder,

    batch_no: body.batch_no,
    manufacture_date: body.mfg_date,
    expiry_date: body.exp_date,

    hsncode: body.hsncode,
    rack_no: body.rack_no,

    quantity: Number(body.quantity),
    free_quantity: Number(body.free_quantity || 0),
    total_quantity: Number(body.total_quantity),
    unit: Number(body.unit),
    total_stock: Number(body.total_stock),

    purchase_price_unit: Number(body.purchase_price_per_unit),
    purchase_price_quantity: Number(body.purchase_price_per_quantity),
    selling_price_unit: Number(body.selling_price_per_unit),
    selling_price_quantity: Number(body.selling_price_per_quantity),

    profit: Number(body.profit_percent),
    mrp: body.mrp ? Number(body.mrp) : undefined,

    purchase_details: body.purchase_details,

    supplier_id: body.supplier_id,
 
    reason: 'Initial Stock',
  };

  return this.service.createMedicineWithBatchAndStock(dto);
}
@Post('medicine/medicine-exist-upload')
async bulkExistingMedicineUpload(@Body() body: any) {
  const shopId = Number(body.shop_id);
  const batches = body.batches ?? [];

  return this.service.createBulkExistingMedicineWithStock(
    shopId,
    batches,
  );
}

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
    rack_no: body.rack_no,

    quantity: Number(body.quantity),
    free_quantity: Number(body.free_quantity || 0),
    total_quantity: Number(body.total_quantity),
    unit: Number(body.unit),

    total_stock: Number(body.total_stock), // ✅ FIX

    purchase_price_unit: Number(body.purchase_price_per_unit),
    purchase_price_quantity: Number(body.purchase_price_per_quantity),
    selling_price_unit: Number(body.selling_price_per_unit),
    selling_price_quantity: Number(body.selling_price_per_quantity),

    profit: body.profit_percent ? Number(body.profit_percent) : undefined,
    mrp: body.mrp ? Number(body.mrp) : undefined,

    purchase_details: body.purchase_details,

    supplier_id: body.supplier_id,

    reason: body.reason ?? 'New Batch',
  };

  return this.service.createBatchWithStock(Number(medicineId), dto);
}

@Get('medicine/:id/shop/:shop_id')
getMedicine(@Param('id') id: string, @Param('shop_id') shop_id: string) {
  return this.service.getMedicineWithBatches(+id, +shop_id);
}

@Get('medicine/shop/:shop_id')
getAllMedicines(@Param('shop_id') shop_id: string) {
  return this.service.getAllMedicinesWithBatches(+shop_id);
}

}
