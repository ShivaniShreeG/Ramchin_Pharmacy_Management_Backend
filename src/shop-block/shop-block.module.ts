import { Module } from '@nestjs/common';
import { ShopBlockService } from './shop-block.service';
import { ShopBlockController } from './shop-block.controller';

@Module({
  controllers: [ShopBlockController],
  providers: [ShopBlockService],
})
export class ShopBlockModule {}
