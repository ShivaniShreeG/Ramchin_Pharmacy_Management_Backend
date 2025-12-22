import { Injectable, BadRequestException,NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';

const prisma = new PrismaClient();

@Injectable()
export class MedicineBatchService {

  create(dto: CreateMedicineBatchDto) {
    return prisma.medicineBatch.create({ data: dto });
  }

getExpiredMedicineBatches(shopId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ⬅️ normalize

  return prisma.medicineBatch.findMany({
    where: {
      shop_id: shopId,
      expiry_date: {
        lte: today, // ✅ include today
      },
      total_stock: { not: 0 },
      is_active: true,
    },
    include: {
      medicine: true,
    },
    orderBy: {
      expiry_date: 'asc',
    },
  });
}

getDeactivatedMedicineBatches(shopId: number) {
  return prisma.medicineBatch.findMany({
    where: {
      shop_id: shopId,
      is_active: false,           // 🚫 deactivated batch
      total_stock: {
        not: 0,                   // 📦 still has stock
      },
    },
    include: {
      medicine: true,             // 💊 include medicine details
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}
// medicine-batch.service.ts
async removeBatch(
  shopId: number,
  medicineId: number,
  batchId: number,
) {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ Fetch batch
    const batch = await tx.medicineBatch.findFirst({
      where: {
        id: batchId,
        medicine_id: medicineId,
        shop_id: shopId,
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const stockToRemove = batch.total_stock ?? 0;

    if (stockToRemove <= 0) {
      throw new BadRequestException('Batch already empty');
    }

    // 2️⃣ Update batch → stock 0
    await tx.medicineBatch.update({
      where: { id: batchId },
      data: {
        total_stock: 0,
        quantity: 0,
        is_active: false,
      },
    });

    // 3️⃣ Update medicine stock
    await tx.medicine.update({
      where: { id: medicineId },
      data: {
        stock: {
          decrement: stockToRemove,
        },
      },
    });

    // 4️⃣ Stock movement OUT
    await tx.stockMovement.create({
      data: {
        shop_id: shopId,
        batch_id: batchId,
        movement_type: 'OUT',
        quantity: stockToRemove,
        reason: batch.is_active ? 'expired' : 'deactivated',
        reference: `Batch ${batch.batch_no} removed`,
      },
    });

    return {
      success: true,
      message: 'Batch removed and stock updated',
    };
  });
}

  findAll(shop_id: number) {
    return prisma.medicineBatch.findMany({
      where: { shop_id },
      include: { medicine: true },
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: number) {
    return prisma.medicineBatch.findUnique({ where: { id } });
  }

  update(id: number, dto: any) {
    return prisma.medicineBatch.update({
      where: { id },
      data: dto,
    });
  }

}
