import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

const prisma = new PrismaClient();

@Injectable()
export class ProfileService {
  private toBase64(profile: any) {
    if (profile?.shop?.logo) {
      return {
        ...profile,
        shop: {
          ...profile.shop,
          logo: Buffer.from(profile.shop.logo).toString('base64'),
        },
      };
    }
    return profile;
  }

  private async getProfile(role: 'ADMIN' | 'ADMINISTRATOR', shopId: number, userId: string) {
    let record;

    if (role === 'ADMIN') {
      record = await prisma.admin.findUnique({
        where: { user_id_shop_id: { shop_id: shopId, user_id: userId } },
        select: {
          id: true,
          name: true,
          designation: true,
          phone: true,
          email: true,
          shop: { select: { logo: true, name: true } },
        },
      });

      if (!record) throw new NotFoundException(`Admin not found in shop ${shopId}`);

      return this.toBase64({
        role: 'ADMIN',
        name: record.name,
        designation: record.designation,
        phone: record.phone,
        email: record.email,
        shop: record.shop,
      });
    } else {
      record = await prisma.administrator.findUnique({
        where: { user_id_shop_id: { shop_id: shopId, user_id: userId } },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          shop: { select: { logo: true, name: true } },
        },
      });

      if (!record) throw new NotFoundException(`Administrator not found in shop ${shopId}`);

      return this.toBase64({
        role: 'ADMINISTRATOR',
        name: record.name,
        phone: record.phone,
        email: record.email,
        shop: record.shop,
      });
    }
  }

  async updateProfile(role: 'ADMIN' | 'ADMINISTRATOR', shopId: number, userId: string, dto: UpdateProfileDto) {
    if (role === 'ADMIN') {
      const existing = await prisma.admin.findUnique({
        where: { user_id_shop_id: { shop_id: shopId, user_id: userId } },
      });

      if (existing) {
        await prisma.admin.update({
          where: { user_id_shop_id: { shop_id: shopId, user_id: userId } },
          data: {
            name: dto.name ?? existing.name,
            phone: dto.phone ?? existing.phone,
            email: dto.email ?? existing.email,
          },
        });
      } else {
        await prisma.admin.create({
          data: {
            shop_id: shopId,
            user_id: userId,
            name: dto.name ?? '',
            phone: dto.phone ?? '',
            email: dto.email ?? '',
            designation: '',
          },
        });
      }

      return this.getProfile(role, shopId, userId);
    } else {
      const existing = await prisma.administrator.findUnique({
        where: { user_id_shop_id: { shop_id: shopId, user_id: userId } },
      });

      if (existing) {
        await prisma.administrator.update({
          where: { user_id_shop_id: { shop_id: shopId, user_id: userId } },
          data: {
            name: dto.name ?? existing.name,
            phone: dto.phone ?? existing.phone,
            email: dto.email ?? existing.email,
          },
        });
      } else {
        await prisma.administrator.create({
          data: {
            shop_id: shopId,
            user_id: userId,
            name: dto.name ?? '',
            phone: dto.phone ?? '',
            email: dto.email ?? '',
          },
        });
      }

      return this.getProfile(role, shopId, userId);
    }
  }

  getAdminProfile(shopId: number, userId: string) {
    return this.getProfile('ADMIN', shopId, userId);
  }

  getAdministratorProfile(shopId: number, userId: string) {
    return this.getProfile('ADMINISTRATOR', shopId, userId);
  }
}
