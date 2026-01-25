import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaClient, StockMovementType, PaymentMode } from '@prisma/client';
import { CreateBillDto } from './dto/create-bill.dto';

const prisma = new PrismaClient();

@Injectable()
export class BillingService {

  
  async getBillingHistoryGroupedByCustomer(shopId: number) {
    try {
      const bills = await prisma.bill.findMany({
        where: {
          shop_id: shopId,
        },
        include: {
          items: {
            include: {
              medicine: true, // all medicine fields
              batch: true,    // all batch fields (rack_no included)
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // 🔹 GROUP BY PHONE + CUSTOMER NAME
      const grouped = bills.reduce((acc, bill) => {
        const key = `${bill.phone}__${bill.customer_name}`;

        if (!acc[key]) {
          acc[key] = {
            phone: bill.phone,
            customer_name: bill.customer_name,
            bills: [],
          };
        }

        acc[key].bills.push(bill);

        return acc;
      }, {} as Record<string, any>);

      // ✅ return array (easy for frontend)
      return Object.values(grouped);

    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw new Error('Failed to fetch billing history');
    }
  }

async getBillingHistory(shopId: number) {
  try {
    const bills = await prisma.bill.findMany({
      where: {
        shop_id: shopId,
      },
      include: {
        items: {
          include: {
            medicine: true, // include all medicine fields
            batch: true,    // include all batch fields
          },
        },
      },
      orderBy: {
        created_at: 'desc', // newest first
      },
    });

    return bills;
  } catch (error) {
    console.error('Error fetching billing history:', error);
    throw new Error('Failed to fetch billing history');
  }
}

  async getBillDetails(shopId: number, billId: number) {
    const bill = await prisma.bill.findUnique({
      where: {
        shop_id_bill_id: {
          shop_id: shopId,
          bill_id: billId,
        },
      },
      include: {
        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return bill;
  }

  async getCustomerNamesByPhone(shopId: number, phone: string) {
  const bills = await prisma.bill.findMany({
    where: {
      shop_id: shopId,
      phone: phone,
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      customer_name: true,
      phone: true,
      created_at: true,
    },
  });

  const map = new Map<string, any>();

  for (const bill of bills) {
    if (!map.has(bill.customer_name)) {
      map.set(bill.customer_name, {
        customer_name: bill.customer_name,
        phone: bill.phone,
        last_bill_date: bill.created_at,
      });
    }
  }

  return Array.from(map.values());
}

  async createBill(input: CreateBillDto) {
    const {
      shop_id,
      user_id,
      customer_name,
      phone,
      doctor_name,
      total,
      payment_mode,
      items,
    } = input;

    return prisma.$transaction(async (tx) => {

      // 1️⃣ Generate bill_id
      const lastBill = await tx.bill.findFirst({
        where: { shop_id },
        orderBy: { bill_id: 'desc' },
      });

      const bill_id = lastBill ? lastBill.bill_id + 1 : 1;

   // 2️⃣ Create Bill (CAPTURE RESULT)
const createdBill = await tx.bill.create({
  data: {
    shop_id,
    bill_id,
    user_id,
    customer_name,
    phone,
    doctor_name,
    total,
    payment_mode,
  },
});


      // 3️⃣ Bill Items + Stock Updates
      for (const item of items) {

        const batch = await tx.medicineBatch.findUnique({
          where: { id: item.batch_id },
        });

        if (!batch) {
          throw new Error(`Batch ${item.batch_id} not found`);
        }

const reduction = item.quantity; // tablets

const newTotalStock = (batch.total_stock ?? 0) - reduction;

const newQuantity = Math.ceil(
  newTotalStock / (batch.unit ?? 1)
);

        if ((batch.total_stock ?? 0) < reduction) {
          throw new Error(`Insufficient stock in batch ${batch.batch_no}`);
        }
        
let paidUnitsSold = 0;
let freeUnitsSold = 0;

// 🔥 EXISTING / LEGACY STOCK
if (batch.purchase_price_unit == null) {
  // No purchase info → treat everything as FREE
  freeUnitsSold = item.quantity;
  paidUnitsSold = 0;
} 
// 🔥 NORMAL PURCHASED STOCK
else {
  const soldUnits = item.quantity;
  const unitPerStrip = batch.unit ?? 1;

  const totalFreeUnits =
    (batch.free_quantity ?? 0) * unitPerStrip;

  const totalStockBeforeSale = batch.total_stock ?? 0;

  const paidUnitsAvailable = Math.max(
    0,
    totalStockBeforeSale - totalFreeUnits
  );

  freeUnitsSold = Math.max(0, soldUnits - paidUnitsAvailable);
  paidUnitsSold = soldUnits - freeUnitsSold;
}

        // 3.1 Bill item
        await tx.billItem.create({
          data: {
            shop_id,
            bill_id,
            medicine_id: item.medicine_id,
            batch_id: item.batch_id,
            unit: item.quantity, // tablets
            unit_price: item.unit_price,
            total_price: item.total_price,
             paid_unit: paidUnitsSold,
    free_unit: freeUnitsSold,
          },
        });

        // 3.2 Update batch stock
     await tx.medicineBatch.update({
  where: { id: item.batch_id },
  data: {
    total_stock: newTotalStock,
    total_quantity: newQuantity, // ✅ derived AFTER total_stock
  },
});


        // 3.3 Update medicine stock
        await tx.medicine.update({
  where: {
    shop_id_id: {
      shop_id,
      id: item.medicine_id,
    },
  },          data: {
            stock: { decrement: reduction },
          },
        });

        // 3.4 Stock movement
        await tx.stockMovement.create({
          data: {
            shop_id,
            batch_id: item.batch_id,
            movement_type: StockMovementType.OUT,
            quantity: reduction, // tablets
            reason: 'Medicine Billing',
            reference: `Bill-${bill_id}`,
          },
        });
      }

      // 4️⃣ Finance
      await tx.finance.create({
        data: {
          shop_id,
          user_id,
          reason: `Billing - ${bill_id}`, // ✅ include bill no
          type: 'INCOME',
          state: payment_mode,
          amount: total,
        },
      });

     return {
  bill_id,
  created_at: createdBill.created_at, // ✅ SEND TO FRONTEND
  message: 'Bill created successfully',
};

    });
  }

  async getBillsByCustomer(
  shopId: number,
  phone: string,
  customerName: string,
) {
  const bills = await prisma.bill.findMany({
    where: {
      shop_id: shopId,
      phone: phone,
      customer_name: customerName,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      items: {
        include: {
          medicine: {
            select: { name: true },
          },
          batch: {
            select: { batch_no: true },
          },
        },
      },
    },
  });

  return {
    customer_name: customerName,
    phone,
    bills: bills.map(bill => ({
      bill_id: bill.bill_id,
      bill_date: bill.created_at,
      doctor_name: bill.doctor_name,
      total: bill.total,
      payment_mode: bill.payment_mode,
      items: bill.items.map(item => ({
        medicine_name: item.medicine.name,
        batch_no: item.batch.batch_no,
        quantity: item.unit,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    })),
  };
}

}

