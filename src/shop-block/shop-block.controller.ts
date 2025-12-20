import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ShopBlockService } from './shop-block.service';

@Controller('shop-blocks')
export class ShopBlockController {
  constructor(private readonly shopBlockService: ShopBlockService) {}

  // GET /lodge-blocks → all lodge blocks
  @Get()
  findAll() {
    return this.shopBlockService.findAll();
  }

  // GET /lodge-blocks/:lodgeId → block(s) for a specific lodge
  @Get(':shopId')
  findByShop(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.shopBlockService.findByShop(shopId);
  }
}
