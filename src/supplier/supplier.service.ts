import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SupplierService {

  // ➕ Create Supplier
  create(shopId: number, dto: CreateSupplierDto) {
    return prisma.supplier.create({
      data: {
        shop_id: shopId,
        ...dto,
      },
    });
  }

  // 📄 Get all suppliers of a shop
  findAll(shopId: number) {
    return prisma.supplier.findMany({
      where: { shop_id: shopId },
      orderBy: { created_at: 'desc' },
    });
  }

  // 🔍 Get single supplier (shop-safe)
  async findOne(shopId: number, id: number) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        shop_id: shopId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  // ✏️ Update supplier (shop-safe)
  async update(shopId: number, id: number, dto: UpdateSupplierDto) {
    await this.findOne(shopId, id);

    return prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  // ❌ Delete supplier (shop-safe)
  async remove(shopId: number, id: number) {
    await this.findOne(shopId, id);

    return prisma.supplier.delete({
      where: { id },
    });
  }
}
