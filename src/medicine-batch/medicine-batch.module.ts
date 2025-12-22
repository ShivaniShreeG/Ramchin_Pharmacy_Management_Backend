import { Module } from '@nestjs/common';
import { MedicineBatchController } from './medicine-batch.controller';
import { MedicineBatchService } from './medicine-batch.service';

@Module({
  controllers: [MedicineBatchController],
  providers: [MedicineBatchService],
})
export class MedicineBatchModule {}
