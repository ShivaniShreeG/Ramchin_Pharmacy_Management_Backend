import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdminService {
  // ====== Admin table ======

  async findAllAdminsByShop(shopId: number) {
    const admins = await prisma.admin.findMany({
      where: { shop_id: shopId },
      select: {
        id: true,
        shop_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });

    if (!admins.length)
      throw new NotFoundException(`No admins found for shop ID ${shopId}`);
    return admins;
  }

  async findAdminByShop(shopId: number, userId: string) {
    const admin = await prisma.admin.findUnique({
      where: {
        user_id_shop_id: {
          shop_id: shopId,
          user_id: userId,
        },
      },
      select: {
        id: true,
        shop_id: true,
        user_id: true,
        name: true,
        designation: true,
        phone: true,
        email: true,
      },
    });

    if (!admin)
      throw new NotFoundException(
        `Admin with user ID ${userId} not found in shop ${shopId}`,
      );
    return admin;
  }

  // ====== Administrator table ======

  // Get all administrators for a lodge
  async findAllAdministratorsByShop(shopId: number) {
    const administrators = await prisma.administrator.findMany({
      where: { shop_id: shopId },
      select: {
        id: true,
        shop_id: true,
        user_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    if (!administrators.length)
      throw new NotFoundException(
        `No administrators found for shop ID ${shopId}`,
      );
    return administrators;
  }

  // Get one administrator by lodge + user_id
  async findAdministratorByShop(shopId: number, userId: string) {
    const administrator = await prisma.administrator.findUnique({
      where: {
        user_id_shop_id: {
          shop_id: shopId,
          user_id: userId,
        },
      },
      select: {
        id: true,
        shop_id: true,
        user_id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    if (!administrator)
      throw new NotFoundException(
        `Administrator with user ID ${userId} not found in shop ${shopId}`,
      );
    return administrator;
  }
}
