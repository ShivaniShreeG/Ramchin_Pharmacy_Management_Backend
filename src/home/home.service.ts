import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HomeService {
  
async getFinanceSummary(shopId: number) {
  // Get current balance (existing calculation)
  const shop = await prisma.shop.findUnique({ where: { shop_id: shopId } });
  if (!shop) throw new NotFoundException(`Shop with ID ${shopId} not found`);

  // Current balance calculation
  const totalIncomeAgg = await prisma.finance.aggregate({
    where: { shop_id: shopId, type: 'INCOME' },
    _sum: { amount: true },
  });
  const totalExpenseAgg = await prisma.finance.aggregate({
    where: { shop_id: shopId, type: 'EXPENSE' },
    _sum: { amount: true },
  });
  const totalDrawingInAgg = await prisma.finance.aggregate({
    where: { shop_id: shopId, type: 'DRAWIN' },
    _sum: { amount: true },
  });
  const totalDrawingOutAgg = await prisma.finance.aggregate({
    where: { shop_id: shopId, type: 'DRAWOUT' },
    _sum: { amount: true },
  });

  const totalIncome = totalIncomeAgg._sum.amount ?? 0;
  const totalExpense = totalExpenseAgg._sum.amount ?? 0;
  const totalDrawingIn = totalDrawingInAgg._sum.amount ?? 0;
  const totalDrawingOut = totalDrawingOutAgg._sum.amount ?? 0;

  const currentBalance =
    totalIncome + totalDrawingIn - totalExpense - totalDrawingOut;

  // Calculate online income only
  const onlineIncomeAgg = await prisma.finance.aggregate({
    where: { shop_id: shopId, type: 'INCOME', state: 'ONLINE' },
    _sum: { amount: true },
  });
  const onlineIncome = onlineIncomeAgg._sum.amount ?? 0;

  // Cash income is remaining portion of current balance
  const cashIncome = currentBalance - onlineIncome;

  return {
    totalIncome,
    totalExpense,
    totalDrawingIn,
    totalDrawingOut,
    currentBalance,
    onlineIncome,
    cashIncome,
  };
}


 async getTotals(shopId: number, date?: string) {
  // 1️⃣ Fetch all active batches
  const batches = await prisma.medicineBatch.findMany({
    where: { shop_id: shopId, is_active: true },
    select: { total_stock: true, selling_price_unit: true, purchase_price_unit: true, medicine_id: true },
  });

  // 2️⃣ Calculate overall stock value
  const overallValue = batches.reduce(
    (acc, batch) => acc + (batch.total_stock ?? 0) * batch.selling_price_unit,
    0,
  );

  // 3️⃣ Count medicines with non-zero stock
  const medicinesWithStock = new Set<number>();
  batches.forEach(batch => {
    if ((batch.total_stock ?? 0) > 0) {
      medicinesWithStock.add(batch.medicine_id);
    }
  });
  const totalMedicinesWithStock = medicinesWithStock.size;

  // 4️⃣ Initialize sales metrics
  let totalSales = 0;
  let totalProfit = 0;
  let totalUnitsSold = 0;
  let totalBills = 0;

  if (date) {
    const startDate = new Date(date + 'T00:00:00');
    const endDate = new Date(date + 'T23:59:59');

    const bills = await prisma.bill.findMany({
      where: {
        shop_id: shopId,
        created_at: { gte: startDate, lte: endDate },
      },
      include: {
        items: {
          include: { batch: true },
        },
      },
    });

    totalBills = bills.length;

    for (const bill of bills) {
      for (const item of bill.items) {
        totalUnitsSold += item.unit;
        totalSales += item.total_price;
 const purchasePrice = item.batch.purchase_price_unit;
    const sellingPrice = item.batch.selling_price_unit;

    const paidUnits = item.paid_unit ?? 0;
    const freeUnits = item.free_unit ?? 0;

    const profit =
      (paidUnits * (sellingPrice - purchasePrice)) +
      (freeUnits * sellingPrice);

    totalProfit += profit;      }
    }
  }

  return {
    overallValue,
    totalMedicinesWithStock,
    totalSales,
    totalBills,
    totalProfit,
    totalUnitsSold,
  };
}

}
