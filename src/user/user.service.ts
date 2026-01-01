import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { CreateUserDto } from './dto/create-user.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  // 🔹 Get all active admins in a lodge

   async checkUserAvailability(shopId: number, userId: string) {
    const exists = await prisma.user.findUnique({
      where: {
        user_id_shop_id: {
          user_id: userId,
          shop_id: Number(shopId),
        },
      },
    });

    return { available: !exists };
  }
  
  async getAdminsByShop(shopId: number) {
    const admins = await prisma.admin.findMany({
      where: {
        shop_id: Number(shopId),
        user: { is_active: true },
      },
      include: {
        user: {
          select: { user_id: true, shop_id: true, role: true, is_active: true },
        },
      },
    });

    return admins.map(a => ({
      user_id: a.user_id,
      designation: a.designation,
      name: a.name,
      phone: a.phone,
      email: a.email,
    }));
  }

  // 🔹 Soft delete admin
  async deleteAdmin(shopId: number, userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
    });

    if (!user)
      throw new NotFoundException(`User ${userId} not found in shop ${shopId}`);

    await prisma.user.update({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
      data: { is_active: false },
    });

    return { message: `User ${userId} deactivated successfully` };
  }

  // 🔹 Get user with lodge + admin data
 async getUserWithAdmin(shopId: number, userId: string) {
  const user = await prisma.user.findUnique({
    where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
    include: {
      shop: true,  // fetch full lodge object
      admin: true,  // fetch related Admin record (1:1)
    },
  });

  if (!user) {
    throw new NotFoundException(
      `User with ID ${userId} not found for shop ${shopId}`,
    );
  }

  // Optional: convert lodge.logo to base64
  let logoBase64: string | null = null;
  if (user.shop?.logo) {
    const buf =
      user.shop.logo instanceof Buffer
        ? user.shop.logo
        : Buffer.from(Object.values(user.shop.logo));
    logoBase64 = buf.toString('base64');
  }

  return {
    user_id: user.user_id,
    shop_id: user.shop_id,
    role: user.role,
    is_active: user.is_active,
    shop: {
      shop_id: user.shop.shop_id,
      name: user.shop.name,
      is_active: user.shop.is_active,
      logo: logoBase64,
    },
    admins: user.admin
      ? [
          {
            designation: user.admin.designation,
            name: user.admin.name,
            phone: user.admin.phone,
            email: user.admin.email,
          },
        ]
      : [],
  };
}

  // 🔹 Add admin + user together
  async addAdmin(dto: CreateUserDto) {
    const shop = await prisma.shop.findUnique({ where: { shop_id: dto.shop_id } });
    if (!shop)
      throw new NotFoundException(`Shop with ID ${dto.shop_id} not found`);

    const existing = await prisma.user.findUnique({
      where: { user_id_shop_id: { user_id: dto.user_id, shop_id: dto.shop_id } },
    });
    if (existing)
      throw new ForbiddenException(`User ${dto.user_id} already exists`);

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const [newUser, newAdmin] = await prisma.$transaction([
      prisma.user.create({
        data: {
          user_id: dto.user_id,
          shop_id: dto.shop_id,
          password: hashedPassword,
          role: Role.ADMIN,
          is_active: dto.is_active ?? true,
        },
      }),
      prisma.admin.create({
        data: {
          user_id: dto.user_id,
          shop_id: dto.shop_id,
          designation: dto.designation,
          name: dto.name ?? '',
          phone: dto.phone ?? '',
          email: dto.email ?? '',
        },
      }),
    ]);

    return { message: 'Admin created successfully', user: newUser, admin: newAdmin };
  }

  // 🔹 Fetch all users in a lodge
  async findAllByShop(shopId: number) {
    const users = await prisma.user.findMany({
      where: { shop_id: shopId },
      select: { user_id: true, shop_id: true, role: true, is_active: true },
    });

    if (!users.length)
      throw new NotFoundException(`No users found for shop ${shopId}`);
    return users;
  }

  // 🔹 Get user with lodge info
async findOneByShop(shopId: number, userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      user_id_shop_id: { user_id: userId, shop_id: shopId },
    },
    select: {
      user_id: true,
      shop_id: true,
      password: true,
      role: true,
      is_active: true,
      shop: {
        select: {
          shop_id: true,
          name: true,
          is_active: true,
          logo: true,
          blocks: { select: { reason: true } }, // fetch lodge block reason
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found in shop ${shopId}`);
  }

  // Determine lodge block reason if inactive
  let shopBlockReason = '';
  if (!user.shop?.is_active) {
    shopBlockReason =
      user.shop.blocks.length > 0
        ? user.shop.blocks[0].reason
        : 'Shop is inactive';
  }

  // Determine user block reason if inactive
  let userBlockReason = '';
  if (!user.is_active) {
    userBlockReason = 'Your account has been deactivated';
  }

  // Convert lodge.logo to base64 if present
  let logoBase64: string | null = null;
  if (user.shop?.logo) {
    const buf =
      user.shop.logo instanceof Buffer
        ? user.shop.logo
        : Buffer.from(Object.values(user.shop.logo));
    logoBase64 = buf.toString('base64');
  }

  return {
    user_id: user.user_id,
    shop_id: user.shop_id,
    role: user.role,
    is_active: user.is_active,
    userBlockReason, // frontend can use this to show dialog
    shop: {
      shop_id: user.shop.shop_id,
      name: user.shop.name,
      is_active: user.shop.is_active,
      logo: logoBase64,
      shopBlockReason, // frontend can use this to show dialog
    },
  };
}


  // 🔹 Login
async login(shopId: number, userId: string, password: string) {
  try {
    // Fetch user and lodge status
    const user = await prisma.user.findUnique({
      where: { user_id_shop_id: { user_id: String(userId), shop_id: Number(shopId) } },
      select: {
        user_id: true,
        shop_id: true,
        password: true,
        role: true,
        is_active: true,
        shop: {
          select: { 
            is_active: true,
            blocks: { select: { reason: true } }, // fetch block info
          },
        },
      },
    });

    if (!user) return { success: false, message: 'User not found' };

    // Check if lodge is inactive
    if (!user.shop.is_active) {
      const blockReason = user.shop.blocks.length > 0
        ? user.shop.blocks[0].reason
        : 'Shop is inactive';
      return { success: false, message: `Shop access denied. Reason: ${blockReason}` };
    }

    // Check user status
    if (!user.is_active) return { success: false, message: 'Account inactive' };

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return { success: false, message: 'Incorrect password' };

    // Role check
    if (![Role.ADMIN, Role.ADMINISTRATOR].includes(user.role)) {
      return { success: false, message: 'Access denied' };
    }

    // Fetch designation only if role is ADMIN or ADMINISTRATOR
    let designation: string | null = null;
if (user.role === Role.ADMIN || user.role === Role.ADMINISTRATOR) {
  const admin = await prisma.admin.findUnique({
    where: { 
      user_id_shop_id: { 
        user_id: user.user_id, 
        shop_id: user.shop_id 
      } 
    },
    select: { designation: true },
  });
  designation = admin?.designation ?? null;
}


    return {
      success: true,
      message: 'Login successful',
      user: {
        shopId: user.shop_id,
        userId: user.user_id,
        role: user.role,
        designation, // ✅ send designation only for admins
      },
    };
  } catch (e) {
    console.error('Login error:', e);
    return { success: false, message: 'Internal server error' };
  }
}



  // 🔹 Change password
  async changePassword(shopId: number, userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
      select: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(oldPass, user.password);
    if (!match) throw new ForbiddenException('Old password incorrect');

    const hashed = await bcrypt.hash(newPass, 12);
    await prisma.user.update({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  // 🔹 Send OTP via email
  async sendOtp(shopId: number, userId: string, otp: string) {
    const admin = await prisma.admin.findUnique({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
    });

    if (!admin?.email)
      throw new NotFoundException({ message: 'Email not found' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Noreply.ramchintech@gmail.com',
        pass: 'zkvb rmyu yqtm ipgv', // 🔒 app password
      },
    });

    await transporter.sendMail({
      from: 'Noreply.ramchintech@gmail.com',
      to: admin.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });

    return { status: 'success', message: 'OTP sent successfully' };
  }

  // 🔹 Update password after OTP
  async updatePassword(shopId: number, userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
    });
    if (!user) throw new NotFoundException('User not found');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
      data: { password: hashed },
    });

    return { status: 'success', message: 'Password updated successfully' };
  }
}
