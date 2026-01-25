import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/reorder.dto';

const prisma = new PrismaClient();

@Injectable()
export class ReorderService {

 async getReorderMedicinesWithSupplier(shopId: number) {
  const medicines = await prisma.medicine.findMany({
    where: {
      shop_id: shopId,
      is_active: true,
      reorder: { not: null },
      stock: {
        lte: prisma.medicine.fields.reorder,
      },
     order_status: 'NOT_ORDERED',

    },
    include: {
      batches: {
        where: {
          is_active: true,
          supplier_id: { not: null },
        },
        orderBy: { created_at: 'desc' },
        take: 1,
        include: {
          supplier: true, // ✅ IMPORTANT
        },
      },
    },
  });

  return medicines.map((medicine) => {
    const lastBatch = medicine.batches[0];

    return {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      category: medicine.category,
      current_stock: medicine.stock,
      reorder_level: medicine.reorder,

      last_supplier: lastBatch?.supplier
        ? {
            id: lastBatch.supplier.id,
            name: lastBatch.supplier.name,
            phone: lastBatch.supplier.phone,
            email: lastBatch.supplier.email,
          }
        : null,
    };
  });
}

 async getSupplierWiseReorderList(shopId: number) {
  const reorderList = await this.getReorderMedicinesWithSupplier(shopId);

  const groupedSuppliers: Record<number, any> = {};

  for (const item of reorderList) {
    const supplier = item.last_supplier;
    if (!supplier || !supplier.id) continue;

    const supplierId = supplier.id;

    if (!groupedSuppliers[supplierId]) {
      groupedSuppliers[supplierId] = {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email ?? null,
        },
        medicines: [],
      };
    }

    groupedSuppliers[supplierId].medicines.push({
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      category: item.category,
      current_stock: item.current_stock,
      reorder_level: item.reorder_level,
    });
  }

  return Object.values(groupedSuppliers);
}

async createMedicineOrder(
  shopId: number,
  dto: CreateOrderDto,
) {
  const { supplier_id, items } = dto;

  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      // 1️⃣ Insert into OrderReceived
      await tx.orderReceived.create({
        data: {
          shop_id: shopId,                 // ✅ from param
          supplier_id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          status: 'ORDERED',
        },
      });

      // 2️⃣ Update Medicine status
      await tx.medicine.update({
where: {
  shop_id_id: {
    shop_id: shopId,
    id: item.medicine_id,
  },
}      ,
  data: {
          order_status: 'ORDERED',
        },
      });
    }

    return {
      message: 'Medicine order placed successfully',
      total_items: items.length,
    };
  });
}

async getOrderedMedicines(shopId: number) {
  const orders = await prisma.orderReceived.findMany({
    where: {
      shop_id: shopId,
      status: 'ORDERED',
    },
    include: {
      medicine: true,
      supplier: true,
    },
  });

  return orders.map(o => ({
    order_id: o.id,
    order_date: o.order_date,
    quantity: o.quantity,
    medicine: {
      id: o.medicine.id,
      name: o.medicine.name,
      category: o.medicine.category,
      current_stock: o.medicine.stock,
      reorder_level: o.medicine.reorder,
    },
    supplier: {
      id: o.supplier.id,
      name: o.supplier.name,
      phone: o.supplier.phone,
      email: o.supplier.email,
    },
  }));
}

}
