import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FinanceService {

    async createDrawingFinance(data: {
  shop_id: number;
  user_id: string;
  reason: string;
  amount: number;
  type: 'IN' | 'OUT';   // 👈 frontend sends this
  state?: string;       // optional, defaults to OTHER
}) {
  return await prisma.finance.create({
    data: {
      shop_id: data.shop_id,
      user_id: data.user_id,
      reason: data.reason,
      amount: data.amount,
      state: data.state ?? 'OTHER',
      type: data.type === 'IN' ? 'DRAWIN' : 'DRAWOUT', // 🔥 mapping
    },
  });
}

    async getDrawingFinances(shop_id: number) {
  return await prisma.finance.findMany({
    where: {
      shop_id,
      type: {
        in: ['DRAWIN', 'DRAWOUT'], // 👈 OR condition
      },
    },
    orderBy: { created_at: 'desc' },
    include: {
      user: true,
    },
  });
}

async getIncomeFinances(shop_id: number) {
  return await prisma.finance.findMany({
    where: {
      shop_id,
      type: 'INCOME',
    },
    orderBy: { created_at: 'desc' },
    include: {
      user: true,
    },
  });
}
    // ----------------- READ EXPENSE (all for a shop) -----------------
async getExpenseFinances(shop_id: number) {
  return await prisma.finance.findMany({
    where: {
      shop_id,
      type: 'EXPENSE',
    },
    orderBy: { created_at: 'desc' },
    include: {
      user: true,
    },
  });
}

    // ----------------- CREATE EXPENSE FINANCE -----------------
async createExpenseFinance(data: {
  shop_id: number;
  user_id: string;
  reason: string;
  amount: number;
  state?: string; // optional, defaults to OTHER
}) {
  return await prisma.finance.create({
    data: {
      ...data,
      type: 'EXPENSE',             // fixed type
      state: data.state ?? 'OTHER', // default if not provided
    },
  });
}

  // ----------------- CREATE INCOME FINANCE -----------------
  async createIncomeFinance(data: {
    shop_id: number;
    user_id: string;
    reason: string;
    amount: number;
    state?: string; // optional, defaults to OTHER
  }) {
    return await prisma.finance.create({
      data: {
        ...data,
        type: 'INCOME',
        state: data.state ?? 'OTHER',
      },
    });
  }

  // ----------------- READ (single) -----------------
  async getFinanceById(id: number) {
    const finance = await prisma.finance.findUnique({
      where: { id },
      include: {
        shop: true,
        user: true,
      },
    });
    if (!finance) throw new NotFoundException(`Finance record with ID ${id} not found`);
    return finance;
  }

  // ----------------- READ ALL FINANCES FOR SHOP -----------------
  async getAllFinances(shop_id: number) {
    return await prisma.finance.findMany({
      where: { shop_id },
      orderBy: { created_at: 'desc' },
      include: { user: true },
    });
  }

  // ----------------- READ INCOME WITH STATE != CASH/ONLINE -----------------
  async getIncomeOtherFinances(shop_id: number) {
    return await prisma.finance.findMany({
      where: {
        shop_id,
        type: 'INCOME',
        NOT: { state: { in: ['CASH', 'ONLINE'] } },
      },
      orderBy: { created_at: 'desc' },
      include: { user: true },
    });
  }

  // ----------------- UPDATE (safe, cannot change type/state) -----------------
  async updateFinanceSafe(
    id: number,
    data: Partial<{ reason: string; amount: number; }>
  ) {
    return await prisma.finance.update({
      where: { id },
      data,
    });
  }

  // ----------------- DELETE -----------------
  async deleteFinance(id: number) {
    return await prisma.finance.delete({
      where: { id },
    });
  }
}
