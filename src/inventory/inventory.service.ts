import { Injectable } from '@nestjs/common';
import { CreateMedicineWithBatchDto } from './dto/create-medicine-with-batch.dto';
import { StockMovementType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { UpdateInventoryStatusDto } from './dto/update-inventory-status.dto';
import { CreateBatchWithStockDto } from './dto/create-batch-with-stock.dto';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {

    async getExtraCategories(shop_id: number) {
  const defaultCategories = [
    'Tablets',
    'Syrups',
    'Drops',
    'Ointments',
    'Creams',
    'Soap',
    'Other',
  ];

  const result = await prisma.medicine.findMany({
    where: {
      shop_id,
      is_active: true,
      category: {
        notIn: defaultCategories,
      },
    },
    select: {
      category: true,
    },
    distinct: ['category'], // ✅ IMPORTANT
  });

  // Return as string array
  return result.map((r) => r.category);
}

  async createBulkMedicineWithBatchAndStock(
  shopId: number,
  batches: any[],
) {
  return prisma.$transaction(async (tx) => {

    const results: {
      medicine_id: number;
      batch_id: number;
    }[] = [];

    for (const body of batches) {

      // 1️⃣ CREATE MEDICINE
      const medicine = await tx.medicine.create({
        data: {
          shop_id: shopId,
          name: body.medicine_name,
          category: body.category,
          ndc_code: body.ndc_code,
          reorder: Number(body.reorder_level) || 0,
          stock: Number(body.total_stock), // initial stock
        },
      });

      // 2️⃣ CREATE BATCH
      const batch = await tx.medicineBatch.create({
        data: {
          shop_id: shopId,
          medicine_id: medicine.id,

          batch_no: body.batch_no,
          manufacture_date: new Date(body.mfg_date),
          expiry_date: new Date(body.exp_date),

          HSN: body.hsncode,
          rack_no: body.rack_no,

          quantity: Number(body.quantity),
          free_quantity: Number(body.free_quantity || 0),
          total_quantity: Number(body.total_quantity),
          unit: Number(body.unit),

          purchase_price_unit: Number(body.purchase_price_per_unit),
          purchase_price_quantity: Number(body.purchase_price_per_quantity),
          selling_price_unit: Number(body.selling_price_per_unit),
          selling_price_quantity: Number(body.selling_price_per_quantity),

          mrp: body.mrp ? Number(body.mrp) : undefined,
          profit: body.profit_percent
            ? Number(body.profit_percent)
            : undefined,

          purchase_details: body.purchase_details,
          supplier_id: Number(body.supplier_id),

          total_stock: Number(body.total_stock),
          is_active: true,
          created_at: new Date(),
        },
      });

      // 3️⃣ STOCK MOVEMENT
      await tx.stockMovement.create({
        data: {
          shop_id: shopId,
          batch_id: batch.id,
          movement_type: StockMovementType.IN,
          quantity: Number(body.total_stock),
          reason: body.reason ?? 'Bulk Medicine Upload',
        },
      });

      results.push({
        medicine_id: medicine.id,
        batch_id: batch.id,
      });
    }

    return {
      message: 'Bulk medicine upload successful',
      total_uploaded: results.length,
      data: results,
    };
  });
}

  async createBulkBatchWithStock(
  shopId: number,
  batches: any[],
) {
  return prisma.$transaction(async (tx) => {

    const results: { medicine_id: number; batch_id: number }[] = [];

    for (const body of batches) {
      const medicineId = Number(body.medicine_id);

      const dto: CreateBatchWithStockDto = {
        shop_id: shopId,
        batch_no: body.batch_no,
        manufacture_date: body.mfg_date,
        expiry_date: body.exp_date,
        hsncode: body.hsncode,
        rack_no: body.rack_no,
        quantity: Number(body.quantity),
        free_quantity: Number(body.free_quantity || 0),
        total_quantity: Number(body.total_quantity),
        unit: Number(body.unit),
        total_stock: Number(body.total_stock),
        purchase_price_unit: Number(body.purchase_price_per_unit),
        purchase_price_quantity: Number(body.purchase_price_per_quantity),
        selling_price_unit: Number(body.selling_price_per_unit),
        selling_price_quantity: Number(body.selling_price_per_quantity),
        profit: body.profit_percent ? Number(body.profit_percent) : undefined,
        mrp: body.mrp ? Number(body.mrp) : undefined,
        purchase_details: body.purchase_details,
        supplier_id: Number(body.supplier_id),
        reason: body.reason ?? 'Bulk Upload',
      };

const batch = await tx.medicineBatch.create({
        data: {
          shop_id: dto.shop_id,
          medicine_id: medicineId,

          batch_no: dto.batch_no,
          manufacture_date: new Date(dto.manufacture_date),
          expiry_date: new Date(dto.expiry_date),

          HSN: dto.hsncode,
          rack_no: dto.rack_no,

          quantity: dto.quantity,
          free_quantity: dto.free_quantity ?? 0,
          total_quantity: dto.total_quantity,
          unit: dto.unit,

          purchase_price_unit: dto.purchase_price_unit,
          purchase_price_quantity: dto.purchase_price_quantity,
          selling_price_unit: dto.selling_price_unit,
          selling_price_quantity: dto.selling_price_quantity,

          mrp: dto.mrp,
          profit: dto.profit,
          purchase_details: dto.purchase_details,

          supplier_id: dto.supplier_id,
          total_stock: dto.total_stock,

          is_active: true,
          created_at: new Date(),
        },
      });
   await tx.stockMovement.create({
        data: {
          shop_id: dto.shop_id,
          batch_id: batch.id,
          movement_type: StockMovementType.IN,
          quantity: dto.total_stock,
          reason: dto.reason,
        },
      });
 await tx.medicine.update({
        where: { id: medicineId },
        data: {
          stock: { increment: dto.total_stock },
        },
      });
      results.push({
        medicine_id: medicineId,
        batch_id: batch.id,
      });
    }

    return {
      message: 'Bulk batch upload successful',
      total_uploaded: results.length,
      data: results,
    };
  });
}

async getMedicineStockHistory(shop_id: number) {
  return prisma.medicine.findMany({
    where: {
      shop_id,
    },
    include: {
      batches: {
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              address: true,
            },
          },
          movements: {
            orderBy: {
              movement_date: 'desc',
            },
          },
        },
        orderBy: {
          expiry_date: 'asc',
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}


   async checkBatchExists(
    shopId: number,
    medicineId: number,
    batchNo: string,
  ): Promise<boolean> {
    const batch = await prisma.medicineBatch.findFirst({
      where: {
        shop_id: shopId,
        medicine_id: medicineId,
        batch_no: batchNo,
      },
      select: { id: true },
    });

    return !!batch;
  }

   async isMedicineNameTaken(shop_id: number, name: string): Promise<boolean> {
    const existing = await prisma.medicine.findFirst({
      where: {
        shop_id,
        name: {
          equals: name.trim(),
        },
      },
    });
    return !!existing;
  }

async createMedicineWithBatchAndStock(dto: CreateMedicineWithBatchDto) {
  return prisma.$transaction(async (tx) => {

    // 1️⃣ Create Medicine
    const medicine = await tx.medicine.create({
      data: {
        shop_id: dto.shop_id,
        name: dto.name,
        category: dto.category,
        ndc_code: dto.ndc_code,
        stock: dto.total_stock, // ✅ FIXED
        reorder: dto.reorder,
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
        HSN: dto.hsncode,

        quantity: dto.quantity,
        free_quantity: dto.free_quantity ?? 0,
        total_quantity: dto.total_quantity,
        unit: dto.unit,

        purchase_price_unit: dto.purchase_price_unit,
        purchase_price_quantity: dto.purchase_price_quantity,
        selling_price_unit: dto.selling_price_unit,
        selling_price_quantity: dto.selling_price_quantity,

        mrp: dto.mrp,
        profit: dto.profit,
        purchase_details: dto.purchase_details,

        rack_no: dto.rack_no,
        supplier_id: dto.supplier_id,

        total_stock: dto.total_stock, // ✅ FIXED
        is_active: true,
        created_at: new Date(),
      },
    });

    // 3️⃣ Stock Movement (IN)
    const stock = await tx.stockMovement.create({
      data: {
        shop_id: dto.shop_id,
        batch_id: batch.id,
        movement_type: StockMovementType.IN,
        quantity: dto.total_stock, // ✅ FIXED
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

    // 1️⃣ Create Batch
    const batch = await tx.medicineBatch.create({
      data: {
        shop_id: dto.shop_id,
        medicine_id,

        batch_no: dto.batch_no,
        manufacture_date: new Date(dto.manufacture_date),
        expiry_date: new Date(dto.expiry_date),

        HSN: dto.hsncode,
        rack_no: dto.rack_no,

        quantity: dto.quantity,
        free_quantity: dto.free_quantity ?? 0,
        total_quantity: dto.total_quantity,
        unit: dto.unit,

        purchase_price_unit: dto.purchase_price_unit,
        purchase_price_quantity: dto.purchase_price_quantity,
        selling_price_unit: dto.selling_price_unit,
        selling_price_quantity: dto.selling_price_quantity,

        mrp: dto.mrp,
        profit: dto.profit,
        purchase_details: dto.purchase_details,

        supplier_id: dto.supplier_id,

        total_stock: dto.total_stock,
        is_active: true,
        created_at: new Date(),
      },
    });

    // 2️⃣ Stock IN
    const stock = await tx.stockMovement.create({
      data: {
        shop_id: dto.shop_id,
        batch_id: batch.id,
        movement_type: StockMovementType.IN, // ✅ enum-safe
        quantity: dto.total_stock,
        reason: dto.reason,
      },
    });

    // 3️⃣ Update Medicine Stock
    await tx.medicine.update({
      where: { id: medicine_id },
      data: {
        stock: { increment: dto.total_stock },
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
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              address: true,
            },
          },
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
