import { Module } from '@nestjs/common';
import { SalesService } from './sale.service';
import { SalesController } from './sale.controller';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
