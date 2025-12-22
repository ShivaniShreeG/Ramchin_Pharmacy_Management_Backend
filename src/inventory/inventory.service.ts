import { Injectable } from '@nestjs/common';
import { CreateMedicineWithBatchDto } from './dto/create-medicine-with-batch.dto';
import { StockMovementType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { UpdateInventoryStatusDto } from './dto/update-inventory-status.dto';
import { CreateBatchWithStockDto } from './dto/create-batch-with-stock.dto';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {

  // ✅ CREATE MEDICINE + BATCH + STOCK
 async createMedicineWithBatchAndStock(dto: CreateMedicineWithBatchDto) {
  return prisma.$transaction(async (tx) => {

    // 1️⃣ Create Medicine
    const medicine = await tx.medicine.create({
      data: {
        shop_id: dto.shop_id,
        name: dto.name,
        category: dto.category,
        ndc_code: dto.ndc_code,
        stock: dto.stock_quantity,
      },
    });

    // 2️⃣ Create Batch
    const batch = await tx.medicineBatch.create({
      data: {
        shop_id: dto.shop_id,
        medicine_id: medicine.id,
        batch_no: dto.batch_no,

        manufacture_date: new Date(dto.manufacture_date),
        expiry_date: new Date(dto.expiry_date),

        quantity: dto.quantity,
        unit: dto.unit,
        unit_price: dto.unit_price,
        purchase_price: dto.purchase_price,
        selling_price: dto.selling_price,
        single_price: dto.single_price,

        rack_no: dto.rack_no,
        gst: dto.gst,
        profit: dto.profit,
        note: dto.note,

        name: dto.seller_name,
        phone: dto.seller_phone,

        total_stock: dto.stock_quantity,
      },
    });

    // 3️⃣ Stock Movement (IN)
    const stock = await tx.stockMovement.create({
      data: {
        shop_id: dto.shop_id,
        batch_id: batch.id,
        movement_type: StockMovementType.IN,
        quantity: dto.stock_quantity,
        reason: dto.reason,
      },
    });

    return { medicine, batch, stock };
  });
}

async createBatchWithStock(
  medicine_id: number,
  dto: CreateBatchWithStockDto,
) {
  return prisma.$transaction(async (tx) => {

    const batch = await tx.medicineBatch.create({
      data: {
        shop_id: dto.shop_id,
        medicine_id,
        batch_no: dto.batch_no,

        manufacture_date: new Date(dto.manufacture_date),
        expiry_date: new Date(dto.expiry_date),

        quantity: dto.quantity,
        unit: dto.unit,

        unit_price: dto.unit_price,
        purchase_price: dto.purchase_price,
        selling_price: dto.selling_price,
        purchase_stock: dto.stock_quantity,
        rack_no: dto.rack_no,
        profit: dto.profit,
        name: dto.seller_name,
        phone: dto.seller_phone,
        total_stock: dto.stock_quantity,
      },
    });

    // 📦 Stock IN movement
    const stock = await tx.stockMovement.create({
      data: {
        shop_id: dto.shop_id,
        batch_id: batch.id,
        movement_type: 'IN',
        quantity: dto.stock_quantity,
        reason: dto.reason,
      },
    });

    // ⬆️ Update medicine stock
    await tx.medicine.update({
      where: { id: medicine_id },
      data: {
        stock: {
          increment: dto.stock_quantity,
        },
      },
    });

    return { batch, stock };
  });
}



  async getMedicineWithBatches(medicine_id: number) {
  return prisma.medicine.findUnique({
    where: { id: medicine_id },
    include: {
      batches: {
        orderBy: { created_at: 'desc' },
        include: {
          movements: {
            orderBy: { movement_date: 'desc' },
          },
        },
      },
    },
  });
}

async getAllMedicinesWithBatches(shop_id: number) {
  return prisma.medicine.findMany({
    where: {
      shop_id,
    },
    include: {
      batches: {
        where: {
          total_stock: {
            not: 0,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

async updateMedicineOrBatchStatus(dto: UpdateInventoryStatusDto) {
  const { shop_id, medicine_id, batch_id, is_active } = dto;

  return prisma.$transaction(async (tx) => {

    // 🔹 CASE 1: Batch toggle only
    if (batch_id) {
      const batch = await tx.medicineBatch.updateMany({
        where: {
          id: batch_id,
          medicine_id,
          shop_id,
        },
        data: {
          is_active,
        },
      });

      // If batch is being activated, ensure parent medicine is also active
      if (is_active) {
        const medicine = await tx.medicine.findUnique({
          where: { id: medicine_id },
        });

        if (medicine && !medicine.is_active) {
          await tx.medicine.update({
            where: { id: medicine_id },
            data: { is_active: true },
          });
        }
      }

      return {
        message: 'Batch status updated',
        batch_id,
        is_active,
      };
    }

    // 🔹 CASE 2: Medicine toggle (affects all batches)
    await tx.medicine.updateMany({
      where: {
        id: medicine_id,
        shop_id,
      },
      data: {
        is_active,
      },
    });

    await tx.medicineBatch.updateMany({
      where: {
        medicine_id,
        shop_id,
      },
      data: {
        is_active,
      },
    });

    return {
      message: 'Medicine and all batches status updated',
      medicine_id,
      is_active,
    };
  });
}


}
