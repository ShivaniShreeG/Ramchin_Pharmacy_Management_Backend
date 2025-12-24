import { Module } from '@nestjs/common';
import { ReorderService } from './reorder.service'; 
import { ReorderController } from './reorder.controller';

@Module({
  controllers: [ReorderController],
  providers: [ReorderService],
})
export class ReorderModule {}
