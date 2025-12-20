import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

const prisma = new PrismaClient();

@Injectable()
export class MessageService {
  // Create a message
  async create(dto: CreateMessageDto) {
    return prisma.message.create({ data: dto });
  }

  // Get all messages for a lodge
  async findAllByShop(shop_id: number) {
    return prisma.message.findMany({
      where: { shop_id },
      orderBy: { created_at: 'desc' },
    });
  }

  // Get one message by ID
  async findOne(id: number) {
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException(`Message with ID ${id} not found`);
    return message;
  }

  // Update message
  async update(id: number, dto: UpdateMessageDto) {
    await this.findOne(id); // Ensure it exists
    return prisma.message.update({ where: { id }, data: dto });
  }

  // Delete message
  async remove(id: number) {
    await this.findOne(id); // Ensure it exists
    return prisma.message.delete({ where: { id } });
  }
}
