import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ShopBlockService {
  // 1️⃣ Fetch all lodge blocks
  async findAll() {
    const blocks = await prisma.shopBlock.findMany({
      select: {
        id: true,
        shop_id: true,
        reason: true,
        shop: {
          select: {
            name: true,
            address: true,
            is_active: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    if (!blocks.length) throw new NotFoundException('No shop blocks found');
    return blocks;
  }

  // 2️⃣ Fetch block(s) by lodge_id
  async findByShop(shopId: number) {
    const blocks = await prisma.shopBlock.findMany({
      where: { shop_id: shopId },
      select: {
        id: true,
        shop_id: true,
        reason: true,
        shop: {
          select: {
            name: true,
            address: true,
            is_active: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    if (!blocks.length)
      throw new NotFoundException(`No block entries found for shop ID ${shopId}`);

    return blocks;
  }
}
