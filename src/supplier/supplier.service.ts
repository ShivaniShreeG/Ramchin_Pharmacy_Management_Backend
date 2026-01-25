import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SupplierService {

  async getSupplierByPhone(shopId: number, phone: string) {
    return prisma.supplier.findMany({
      where: {
        shop_id: shopId,
        phone: {
          contains: phone, // allows partial match
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
      },
    });
  }
  // ➕ Create Supplier
 async create(shopId: number, dto: CreateSupplierDto) {
  return prisma.$transaction(async (tx) => {

    // 1️⃣ Get last supplier for this shop
    const lastSupplier = await tx.supplier.findFirst({
      where: { shop_id: shopId },
      orderBy: { id: 'desc' },
    });

    const supplierId = lastSupplier ? lastSupplier.id + 1 : 1;

    // 2️⃣ Create supplier
    return tx.supplier.create({
      data: {
        id: supplierId,
        shop_id: shopId,
        ...dto,
      },
    });
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
where: {
  shop_id_id: {
    shop_id: shopId,
    id: id,
  },
}  ,
    data: dto,
    });
  }

  // ❌ Delete supplier (shop-safe)
async remove(shopId: number, id: number) { 
  await this.findOne(shopId, id);

  return prisma.supplier.update({
    where: {
  shop_id_id: {
    shop_id: shopId,
    id: id,
  },
},
    data: { 
      is_active: false // ✅ Soft delete instead of hard delete
    }
  });
}

}
