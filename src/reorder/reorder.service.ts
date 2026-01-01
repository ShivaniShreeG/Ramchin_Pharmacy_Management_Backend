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
          where: { is_active: true },
          orderBy: { created_at: 'desc' },
          take: 1, // only last supplier needed
        },
      },
    });

    return medicines.map((medicine) => {
      const lastBatch = medicine.batches[0] || null;

      return {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        category: medicine.category,
        current_stock: medicine.stock,
        reorder_level: medicine.reorder,
        // last_supplier: lastBatch
        //   ? {
        //       name: lastBatch.name,
        //       phone: lastBatch.phone,
        //     }
        //   : null,
      };
    });
  }

  // async getSupplierWiseReorderList(shopId: number) {
  //   const reorderList = await this.getReorderMedicinesWithSupplier(shopId);

  //   const groupedSuppliers: Record<string, any> = {};

  //   reorderList.forEach((item) => {
  //     // if (!item.last_supplier) return;

  //     // const supplierKey = `${item.last_supplier.name}_${item.last_supplier.phone}`;

  //     // if (!groupedSuppliers[supplierKey]) {
  //     //   groupedSuppliers[supplierKey] = {
  //     //     supplier: item.last_supplier,
  //     //     medicines: [],
  //     //   };
  //     // }

  //     groupedSuppliers[supplierKey].medicines.push({
  //       medicine_id: item.medicine_id,
  //       medicine_name: item.medicine_name,
  //       category: item.category,
  //       current_stock: item.current_stock,
  //       reorder_level: item.reorder_level,
  //     });
  //   });

  //   return Object.values(groupedSuppliers);
  // }
}
