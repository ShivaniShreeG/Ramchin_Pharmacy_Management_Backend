import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  // ➕ Create supplier
  @Post(':shopId')
  create(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.supplierService.create(shopId, dto);
  }

  // 📄 List suppliers by shop
  @Get(':shopId')
  findAll(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.supplierService.findAll(shopId);
  }

  // 🔍 Get single supplier (shop-safe)
  @Get(':shopId/:id')
  findOne(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supplierService.findOne(shopId, id);
  }

  // ✏️ Update supplier (shop-safe)
  @Patch(':shopId/:id')
  update(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(shopId, id, dto);
  }

  // ❌ Delete supplier (shop-safe)
  @Delete(':shopId/:id')
  remove(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supplierService.remove(shopId, id);
  }
}
