import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

}
