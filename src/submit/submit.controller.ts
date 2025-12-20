// submit-ticket.controller.ts
import { Controller, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { SubmitTicketService } from './submit.service';
import { CreateSubmitTicketDto } from './dto/create-submit.dto';
import { UpdateSubmitTicketDto } from './dto/update-submit.dto';

@Controller('submit-ticket')
export class SubmitTicketController {
  constructor(private readonly service: SubmitTicketService) {}

  @Post()
  create(@Body() dto: CreateSubmitTicketDto) {
    return this.service.create(dto);
  }

  @Get('shop/:shop_id')
  findAllByShop(@Param('shop_id') shop_id: string) {
    return this.service.findAllByShop(Number(shop_id));
  }

  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubmitTicketDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
