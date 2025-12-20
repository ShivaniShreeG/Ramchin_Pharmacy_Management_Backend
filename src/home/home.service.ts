import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HomeService {
  
async getFinanceSummary(shopId: number) {
  // Check if shop exists
  const shop = await prisma.shop.findUnique({
    where: { shop_id: shopId },
  });

  if (!shop) {
    throw new NotFoundException(`Shop with ID ${shopId} not found`);
  }

  // Total Income
  const totalIncomeAgg = await prisma.finance.aggregate({
    where: {
      shop_id: shopId,
      type: 'INCOME',
    },
    _sum: { amount: true },
  });

  // Total Expense
  const totalExpenseAgg = await prisma.finance.aggregate({
    where: {
      shop_id: shopId,
      type: 'EXPENSE',
    },
    _sum: { amount: true },
  });

  // Total Drawing In
  const totalDrawingInAgg = await prisma.finance.aggregate({
    where: {
      shop_id: shopId,
      type: 'DRAWIN',
    },
    _sum: { amount: true },
  });

  // Total Drawing Out
  const totalDrawingOutAgg = await prisma.finance.aggregate({
    where: {
      shop_id: shopId,
      type: 'DRAWOUT',
    },
    _sum: { amount: true },
  });

  const totalIncome = totalIncomeAgg._sum.amount ?? 0;
  const totalExpense = totalExpenseAgg._sum.amount ?? 0;
  const totalDrawingIn = totalDrawingInAgg._sum.amount ?? 0;
  const totalDrawingOut = totalDrawingOutAgg._sum.amount ?? 0;

  // Current Balance
  const currentBalance =
    totalIncome +
    totalDrawingIn -
    totalExpense -
    totalDrawingOut;

  return {
    totalIncome,
    totalExpense,
    totalDrawingIn,
    totalDrawingOut,
    currentBalance,
  };
}


}
