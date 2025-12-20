import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
@Injectable()
export class DashboardService {

  async getDashboardStats() {
  const totalShopCount = await prisma.shop.count({
    where: {
      shop_id: {
        not: 0
      }
    }
  });

  const totalBillingsCount = await prisma.bill.count();

  const activeUsersCount = await prisma.user.count({
    where: {
      is_active: true,
      shop_id: {
        not: 0
      }
    }
  });

  return {
    totalShopCount,
    totalBillingsCount,
    activeUsersCount,
  };
}


 async getShopStats(shopId: number) {
    const shop = await prisma.shop.findUnique({ where: { shop_id: shopId } });
    if (!shop) throw new NotFoundException(`Shop with ID ${shopId} not found`);

    const totalBillings = await prisma.bill.count({
      where: { shop_id: shopId }
    });

   const incomeAgg = await prisma.finance.aggregate({
    where: {
      shop_id: shopId,
      type: 'INCOME'
    },
    _sum: {
      amount: true
    }
  });

  const expenseAgg = await prisma.finance.aggregate({
    where: {
      shop_id: shopId,
      type: 'EXPENSE'
    },
    _sum: {
      amount: true
    }
  });

    const totalUsers = await prisma.user.count({
      where: {
        shop_id: shopId,
        is_active: true
      }
    });

    return {
      shopId,
      shopName: shop.name,
      totalBillings, 
      totalIncome: incomeAgg._sum.amount || 0,
      totalExpense: expenseAgg._sum.amount || 0,
      totalUsers
    };
  }

}
