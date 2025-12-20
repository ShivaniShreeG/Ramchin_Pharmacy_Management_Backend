import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { BlockShopDto } from './dto/block-shop.dto';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // Get all lodges
  @Get()
  findAll() {
    return this.shopService.findAll();
  }

  // Get single lodge
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.findOne(id);
  }

  // Create lodge
  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.createShop(createShopDto);
  }

  // Update lodge
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    return this.shopService.updateShop(id, updateShopDto);
  }

  // Block / Unblock lodge
  @Patch(':id/block')
  block(
    @Param('id', ParseIntPipe) id: number,
    @Body() blockShopDto: BlockShopDto,
  ) {
    const { block, reason } = blockShopDto;
    return this.shopService.blockShop(id, block, reason);
  }
}
