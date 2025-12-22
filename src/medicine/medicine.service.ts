import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

const prisma = new PrismaClient();

@Injectable()
export class MedicineService {

  async searchMedicines(shopId: number, query: string) {
  const today = new Date();

  const medicines = await prisma.medicine.findMany({
    where: {
      shop_id: shopId,
      is_active: true,
      name: {
        contains: query,
      },
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
          created_at: 'asc', // ✅ FIFO
        },
        select: {
          id: true,
          batch_no: true,
          total_stock: true,
          unit: true,
          selling_price: true,
          expiry_date: true,
        },
      },
    },
    take: 10,
  });

  /// calculate available_qty per batch
  return medicines.map(med => ({
    id: med.id,
    name: med.name,
    batches: med.batches.map(b => ({
      id: b.id,
      batch_no: b.batch_no,
      available_qty: Math.floor((b.total_stock ?? 0) / (b.unit ?? 1)),
      selling_price: b.selling_price,
      unit: b.unit,
      expiry_date: b.expiry_date,
    })),
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
