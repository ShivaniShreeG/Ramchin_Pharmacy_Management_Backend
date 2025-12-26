import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MedicineValueService {

  // ✅ Overall value
  async getOverallValue(shopId: number) {
    const batches = await prisma.medicineBatch.findMany({
      where: { shop_id: shopId, is_active: true },
      select: {
        total_stock: true,
        selling_price: true,
      },
    });

    const totalValue = batches.reduce(
      (acc, batch) => acc + (batch.total_stock ?? 0) * batch.selling_price,
      0,
    );

    return { totalValue };
  }

  // ✅ Medicine-wise value
  async getMedicineWiseValue(shopId: number) {
    const batches = await prisma.medicineBatch.findMany({
      where: { shop_id: shopId, is_active: true },
      select: {
        medicine_id: true,
        total_stock: true,
        selling_price: true,
        medicine: { select: { name: true } },
      },
    });

    const medicineMap: Record<string, number> = {};

    batches.forEach(batch => {
      const name = batch.medicine.name;
      medicineMap[name] = (medicineMap[name] || 0) + ((batch.total_stock ?? 0) * batch.selling_price);
    });

    return Object.entries(medicineMap).map(([medicine, value]) => ({ medicine, value }));
  }

  // ✅ Batch-wise value
  async getBatchWiseValue(shopId: number) {
    const batches = await prisma.medicineBatch.findMany({
      where: { shop_id: shopId, is_active: true },
      select: {
        id: true,
        batch_no: true,
        medicine: { select: { name: true } },
        total_stock: true,
        selling_price: true,
      },
    });

    return batches.map(batch => ({
      batchId: batch.id,
      batchNo: batch.batch_no,
      medicine: batch.medicine.name,
      value: (batch.total_stock ?? 0) * batch.selling_price,
    }));
  }
}
