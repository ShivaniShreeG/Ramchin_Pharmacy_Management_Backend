import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateShopAdminDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface OtpRecord {
  otp: string;
  expiresAt: number;
}
const DEFAULT_ACCESS = {
  manage: { manage: true, payment: true },
  home: true,
  service: { billing: true, stock_movement: true ,reports:true, view: true, history: true, accounts: true},
};

@Injectable()
export class RegisterService {
  private otpStore = new Map<string, OtpRecord>(); // email → OTP mapping

async createShopWithAdmin(dto: CreateShopAdminDto) {
  const {
    shop_id,
    shop_name,
    shop_phone,
    shop_email,
    shop_address,
    user_id,
    password,
    admin_name,
    admin_phone,
    admin_email,
    shop_logo,
  } = dto;

  const logoBuffer = shop_logo ? Buffer.from(shop_logo, 'base64') : undefined;

  // ✅ 1. Check if lodge_id already exists
  const existingShop = await prisma.shop.findUnique({
    where: { shop_id },
  });

  if (existingShop) {
    throw new BadRequestException(`Shop ID ${shop_id} already exists`);
  }

  // ✅ 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // ✅ 3. Create Lodge, User, and Admin
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + 2);

    // Create Lodge using provided ID
    const lodge = await tx.shop.create({
      data: {
        shop_id, // 👈 Use frontend-provided lodge_id
        name: shop_name,
        phone: shop_phone,
        email: shop_email,
        address: shop_address,
        logo: logoBuffer,
        duedate: dueDate,
      },
    });

    // Create User linked to Lodge
    const user = await tx.user.create({
      data: {
        user_id,
        shop_id,
        password: hashedPassword,
        is_active: true,
        role: 'ADMIN',
      },
    });

    // Create Admin linked to Lodge
    const admin = await tx.admin.create({
      data: {
        shop_id,
        user_id: user.user_id,
        name: admin_name,
        phone: admin_phone,
        email: admin_email,
        designation: 'Owner', // ✅ Always set from backend
        access: DEFAULT_ACCESS, // ✅ Set all toggles true
      },
    });

    return {
      message: 'Shop and Admin created successfully',
      shop_id,
      lodge,
      user,
      admin,
    };
  });
}

  async findShopById(shop_id: number) {
    return prisma.shop.findUnique({ where: { shop_id } });
  }

  async sendOtp(email: string, otp: string) {
    this.otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Noreply.ramchintech@gmail.com',
        pass: 'zkvb rmyu yqtm ipgv', // Gmail app password
      },
    });

    const mailOptions = {
      from: 'Noreply.ramchintech@gmail.com',
      to: email,
      subject: 'Your Email Verification Code',
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { status: 'success', message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Email send error:', error);
      throw new BadRequestException({ status: 'error', message: 'Failed to send OTP email' });
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const record = this.otpStore.get(email);
    if (!record) return false;
    if (record.otp !== otp) return false;
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      return false;
    }
    this.otpStore.delete(email); // cleanup
    return true;
  }
}
