import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MedicineValueService {

  async getDailyStockSummary(shopId: number, date: string) {
  const startOfDay = new Date(date + 'T00:00:00');
  const endOfDay = new Date(date + 'T23:59:59');

  // 1️⃣ Previous stock (opening)
  const prevBatches = await prisma.medicineBatch.findMany({
    where: {
      shop_id: shopId,
      is_active: true,
      created_at: { lt: startOfDay },
    },
    select: {
      total_stock: true,
      selling_price_unit: true,
    },
  });

  const previousStockQty = prevBatches.reduce(
    (acc, b) => acc + (b.total_stock ?? 0),
    0,
  );

  const previousStockValue = prevBatches.reduce(
    (acc, b) => acc + (b.total_stock ?? 0) * b.selling_price_unit,
    0,
  );

  // 2️⃣ Today's new stock
  const todayBatches = await prisma.medicineBatch.findMany({
    where: {
      shop_id: shopId,
      is_active: true,
      created_at: { gte: startOfDay, lte: endOfDay },
    },
    select: {
      total_stock: true,
      selling_price_unit: true,
    },
  });

  const newStockQty = todayBatches.reduce(
    (acc, b) => acc + (b.total_stock ?? 0),
    0,
  );

  const newStockValue = todayBatches.reduce(
    (acc, b) => acc + (b.total_stock ?? 0) * b.selling_price_unit,
    0,
  );

  // 3️⃣ Total available today
  const totalStockQty = previousStockQty + newStockQty;
  const totalStockValue = previousStockValue + newStockValue;

  // 4️⃣ Today's sales
  const bills = await prisma.bill.findMany({
    where: {
      shop_id: shopId,
      created_at: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      items: {
        include: { batch: true },
      },
    },
  });

  let stockSoldQty = 0;
  let stockSoldValue = 0;

  for (const bill of bills) {
    for (const item of bill.items) {
      stockSoldQty += item.unit;
      stockSoldValue += item.unit * item.batch.selling_price_unit;
    }
  }

  // 5️⃣ Closing stock
  const stockOnHandQty = totalStockQty - stockSoldQty;
  const stockOnHandValue = totalStockValue - stockSoldValue;

  return {
    previousStock: {
      qty: previousStockQty,
      value: previousStockValue,
    },
    newStockToday: {
      qty: newStockQty,
      value: newStockValue,
    },
    totalStockToday: {
      qty: totalStockQty,
      value: totalStockValue,
    },
    stockSoldToday: {
      qty: stockSoldQty,
      value: stockSoldValue,
    },
    stockOnHand: {
      qty: stockOnHandQty,
      value: stockOnHandValue,
    },
  };
}

  // ✅ Overall value
  async getOverallValue(shopId: number) {
    const batches = await prisma.medicineBatch.findMany({
      where: { shop_id: shopId, is_active: true },
      select: {
        total_stock: true,
        selling_price_unit: true,
      },
    });

    const totalValue = batches.reduce(
      (acc, batch) => acc + (batch.total_stock ?? 0) * batch.selling_price_unit,
      0,
    );
 const totalStock = batches.reduce(
      (acc, batch) => acc + (batch.total_stock ?? 0),
      0,
    );

    return { totalValue, totalStock };
  }

  // ✅ Medicine-wise value
 async getMedicineWiseValue(shopId: number) {
  const batches = await prisma.medicineBatch.findMany({
    where: { shop_id: shopId, is_active: true },
    select: {
      medicine_id: true,
      total_stock: true,
      selling_price_unit: true,
      medicine: { select: { name: true } },
    },
  });

  const medicineMap: Record<
    string,
    { value: number; totalStock: number }
  > = {};

  batches.forEach(batch => {
    const name = batch.medicine.name;
    const stock = batch.total_stock ?? 0;
    const value = stock * batch.selling_price_unit;

    if (!medicineMap[name]) {
      medicineMap[name] = {
        value,
        totalStock: stock,
      };
    } else {
      medicineMap[name].value += value;
      medicineMap[name].totalStock += stock;
    }
  });

  return Object.entries(medicineMap).map(([medicine, data]) => ({
    medicine,
    value: data.value,
    totalStock: data.totalStock,
  }));
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
        selling_price_unit: true,
      },
    });

    return batches.map(batch => ({
      batchId: batch.id,
      batchNo: batch.batch_no,
      medicine: batch.medicine.name,
      totalStock: batch.total_stock ?? 0,
      value: (batch.total_stock ?? 0) * batch.selling_price_unit,
    }));
  }
}
