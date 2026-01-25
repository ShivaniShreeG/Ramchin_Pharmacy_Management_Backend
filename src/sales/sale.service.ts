import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SalesService {

  async getSalesReportByDate(shopId: number, date: string) {
    const startDate = new Date(date + 'T00:00:00');
    const endDate = new Date(date + 'T23:59:59');

    // Fetch all bills for that date
    const bills = await prisma.bill.findMany({
  where: {
    shop_id: Number(shopId), // ✅ Convert to number
    created_at: {
      gte: new Date(`${date}T00:00:00`),
      lte: new Date(`${date}T23:59:59`)
    }
  },
  include: {
    items: {
      include: {
        medicine: true,
        batch: true,
      },
    },
  },
  orderBy: {
    created_at: "desc",
  },
});


    // Aggregate sales summary
    let totalSales = 0;
    let totalProfit = 0;
    let totalUnitsSold = 0;

    const medicineWise = new Map();

    for (const bill of bills) {
      totalSales += bill.total;

      for (const item of bill.items) {
        totalUnitsSold += item.unit;

        const purchasePricePerUnit = item.batch.purchase_price_unit?? 0;
        const sellingPricePerUnit = item.batch.selling_price_unit;

        const paidUnits = item.paid_unit ?? 0;
const freeUnits = item.free_unit ?? 0;

const profit =
  (paidUnits * (sellingPricePerUnit - purchasePricePerUnit)) +
  (freeUnits * sellingPricePerUnit);

        // Medicine-wise aggregation
        const key = item.medicine.name;
        if (!medicineWise.has(key)) {
          medicineWise.set(key, {
            medicine: item.medicine.name,
            quantity_units: 0,
            quantity_strips: 0,
            sales: 0,
            profit: 0,
          });
        }

        const m = medicineWise.get(key);
        m.quantity_units += item.unit;
        m.quantity_strips += item.unit / item.batch.unit;
        m.sales += item.total_price;
        m.profit += profit;
      }
    }

    return {
      summary: {
        totalSales,
        totalBills: bills.length,
        totalProfit,
        totalUnitsSold,
      },
      medicineWise: Array.from(medicineWise.values()),
      bills,
    };
  }
  
}
