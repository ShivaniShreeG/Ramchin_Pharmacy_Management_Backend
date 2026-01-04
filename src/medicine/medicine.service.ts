import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

const prisma = new PrismaClient();

@Injectable()
export class MedicineService {

  async getAllMedicinesWithBatches(shop_id: number) {
  return prisma.medicine.findMany({
    where: {
      shop_id,
      is_active: true, // medicine must be active
      stock: {
        not: 0, // stock must not be zero
      },
    },
    include: {
      batches: {
        where: {
          is_active: true, // batch must be active
          total_stock: {
            not: 0, // batch stock must not be zero
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

async getMedicine(shop_id: number, id: number) {
  return prisma.medicine.findFirst({
    where: {
      id,         
      shop_id,     
    },
  });
}

async searchMedicines(shopId: number, query: string) {
  const today = new Date();

  const medicines = await prisma.medicine.findMany({
    where: {
      shop_id: shopId,
      is_active: true,
      OR: [
  {
    name: {
      contains: query,
    },
  },
  {
    name: {
      contains: query.toLowerCase(),
    },
  },
  {
    name: {
      contains: query.toUpperCase(),
    },
  },
],
      batches: {
        some: {
          is_active: true,
          expiry_date: { gt: today },
          total_stock: { gt: 0 },
        },
      },
    },
    select: {
      id: true,
      name: true,
      batches: {
        where: {
          is_active: true,
          expiry_date: { gt: today },
          total_stock: { gt: 0 },
        },
        orderBy: {
          created_at: 'asc',
        },
        select: {
          id: true,
          batch_no: true,
          rack_no: true,               // ✅ ADD THIS
          total_stock: true,
          unit: true,
          selling_price_unit: true,
          expiry_date: true,
        },
      },
    },
    take: 10,
  });

  return medicines.map(med => ({
    id: med.id,
    name: med.name,
    batches: med.batches.map(b => ({
      id: b.id,
      batch_no: b.batch_no,
      rack_no:b.rack_no,
      available_qty: b.total_stock ,
      selling_price: b.selling_price_unit,
      unit: b.unit,
      expiry_date: b.expiry_date,
    })),
  }));
}

async getLowStockMedicines(shopId: number) {
  const medicines = await prisma.medicine.findMany({
    where: {
      shop_id: shopId,
      is_active: true,
      reorder: {
        not: null,
      },
      // 🔴 low stock condition
      stock: {
        lte: prisma.medicine.fields.reorder,
      },
    },
    select: {
      id: true,
      name: true,
      category: true,
      reorder: true,
      ndc_code: true,
      stock: true,
    },
    orderBy: {
      stock: 'asc', // optional: lowest stock first
    },
  });

  // 🔁 rename stock → total_stock for frontend consistency
  return medicines.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    reorder: m.reorder,
    ndc_code: m.ndc_code,
    total_stock: m.stock ?? 0,
  }));
}


  
  create(dto: CreateMedicineDto) {
    return prisma.medicine.create({
      data: {
        shop_id: dto.shop_id,
        name: dto.name,
        category: dto.category,
        ndc_code: dto.ndc_code,
        stock: 0, // ✅ REQUIRED FIX
      },
    });
  }

  findAll(shop_id: number) {
    return prisma.medicine.findMany({
      where: { shop_id, is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: number) {
    return prisma.medicine.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateMedicineDto) {
    return prisma.medicine.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return prisma.medicine.update({
      where: { id },
      data: { is_active: false },
    });
  }

}
