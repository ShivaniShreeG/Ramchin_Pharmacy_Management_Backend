import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

const prisma = new PrismaClient();

@Injectable()
export class StockMovementService {

  create(dto: CreateStockMovementDto) {
    return prisma.stockMovement.create({ data: dto });
  }

  findAll(shop_id: number) {
    return prisma.stockMovement.findMany({
      where: { shop_id },
      include: { batch: true },
      orderBy: { movement_date: 'desc' },
    });
  }
}
