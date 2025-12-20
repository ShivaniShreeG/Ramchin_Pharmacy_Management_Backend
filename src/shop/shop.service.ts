import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

const prisma = new PrismaClient();

@Injectable()
export class ShopService {
  // Convert lodge logo buffer to base64
  private toBase64(shop: any) {
    if (shop?.logo) {
      const buffer =
        shop.logo instanceof Buffer
          ? shop.logo
          : Buffer.from(Object.values(shop.logo));
      return {
        ...shop,
        logo: buffer.toString('base64'),
      };
    }
    return shop;
  }

  // Get all lodges
  async findAll() {
    const shops = await prisma.shop.findMany({
      where: { shop_id: { not: 0 } },
      select: {
        shop_id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        logo: true,
        duedate: true,
        is_active: true,
      },
    });

    return shops.map(this.toBase64);
  }

  // Get single lodge by id (including block reasons)
  async findOne(id: number) {
    const shop = await prisma.shop.findUnique({
      where: { shop_id: id },
      include: {
        blocks: { select: { reason: true } },
      },
    });

    if (!shop) throw new NotFoundException(`Shop with ID ${id} not found`);

    const shopWithBase64 = this.toBase64(shop);
    const blockReasons = shop.blocks.map(b => b.reason);

    return {
      ...shopWithBase64,
      block_reasons: blockReasons,
    };
  }

  // Create lodge
  async createShop(createShopDto: CreateShopDto) {
    const { shop_id, name, phone, email, address, logo } = createShopDto;
    const logoBuffer = logo ? Buffer.from(logo, 'base64') : undefined;

    const now = new Date();
    const duedate = new Date(now);
    duedate.setMonth(duedate.getMonth() + 2);

    const shop = await prisma.shop.create({
      data: {
        shop_id,
        name,
        phone,
        email,
        address,
        logo: logoBuffer,
        duedate,
      },
    });

    return this.toBase64(shop);
  }

  // Update lodge
  async updateShop(id: number, updateShopDto: UpdateShopDto) {
    const { name, phone, email, address, logo, duedate } = updateShopDto;

    const shop = await prisma.shop.findUnique({ where: { shop_id: id } });
    if (!shop) throw new NotFoundException(`Shop with ID ${id} not found`);

    const logoBuffer = logo ? Buffer.from(logo, 'base64') : undefined;

    const updatedShop = await prisma.shop.update({
      where: { shop_id: id },
      data: {
        name,
        phone,
        email,
        address,
        duedate: duedate ? new Date(duedate) : shop.duedate,
        logo: logoBuffer || shop.logo,
      },
    });

    return this.toBase64(updatedShop);
  }

  // Block / Unblock lodge
  async blockShop(id: number, block: boolean, reason?: string) {
    const shop = await prisma.shop.findUnique({ where: { shop_id: id } });
    if (!shop) throw new NotFoundException(`Shop with ID ${id} not found`);

    if (block) {
      if (!reason) throw new BadRequestException('Block reason is required');

      const updatedShop = await prisma.$transaction(async (tx) => {
        await tx.shopBlock.create({
          data: {
            shop_id: id,
            reason,
          },
        });

        const shopUpdate = await tx.shop.update({
          where: { shop_id: id },
          data: { is_active: false },
        });

        return shopUpdate;
      });

      return {
        message: `Shop has been blocked successfully`,
        shop: this.toBase64(updatedShop),
      };
    } else {
      // Unblock
      const updatedShop = await prisma.$transaction(async (tx) => {
        await tx.shopBlock.deleteMany({ where: { shop_id: id } });

        const shopUpdate = await tx.shop.update({
          where: { shop_id: id },
          data: { is_active: true },
        });

        return shopUpdate;
      });

      return {
        message: `Shop has been unblocked successfully`,
        shop: this.toBase64(updatedShop),
      };
    }
  }
}
