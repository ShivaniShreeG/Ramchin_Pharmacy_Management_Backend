import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

const prisma = new PrismaClient();

@Injectable()
export class MedicineService {

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
