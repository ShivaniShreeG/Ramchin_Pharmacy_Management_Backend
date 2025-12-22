import { Injectable } from '@nestjs/common';
import { PrismaClient, StockMovementType, PaymentMode } from '@prisma/client';
import { CreateBillDto } from './dto/create-bill.dto';

const prisma = new PrismaClient();

@Injectable()
export class BillingService {
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
      // 1️⃣ Generate bill_id per shop
      const lastBill = await tx.bill.findFirst({
        where: { shop_id },
        orderBy: { bill_id: 'desc' },
      });

      const bill_id = lastBill ? lastBill.bill_id + 1 : 1;

      // 2️⃣ Create Bill
      await tx.bill.create({
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

        if (!batch) throw new Error(`Batch ${item.batch_id} not found`);

        const reduction = item.quantity * batch.unit;

        if ((batch.total_stock ?? 0) < reduction) {
          throw new Error(`Insufficient stock in batch ${batch.batch_no}`);
        }

        // Bill Item
        await tx.billItem.create({
          data: {
            shop_id,
            bill_id,
            medicine_id: item.medicine_id,
            batch_id: item.batch_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          },
        });

        // Update batch
        await tx.medicineBatch.update({
          where: { id: item.batch_id },
          data: {
            total_stock: (batch.total_stock ?? 0) - reduction,
            quantity: batch.quantity - item.quantity,
          },
        });

        // Update medicine stock
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicine_id },
        });

        if (!medicine) throw new Error(`Medicine ${item.medicine_id} not found`);

        await tx.medicine.update({
          where: { id: item.medicine_id },
          data: { stock: medicine.stock - reduction },
        });

        // Stock movement
        await tx.stockMovement.create({
          data: {
            shop_id,
            batch_id: item.batch_id,
            movement_type: StockMovementType.OUT,
            quantity: reduction,
            reason: 'Medicine Billing',
            reference: `Bill-${bill_id}`,
          },
        });
      }

      // 4️⃣ Finance Entry
      await tx.finance.create({
        data: {
          shop_id,
          user_id,
          reason: 'Medicine Billing',
          type: 'INCOME',
          state: 'Billing',
          amount: total,
        },
      });

      return {
        bill_id,
        message: 'Bill created successfully',
      };
    });
  }
}
