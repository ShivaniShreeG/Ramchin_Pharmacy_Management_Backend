import { Module } from '@nestjs/common';
import { MedicineValueController } from './medicine-value.controller';
import { MedicineValueService } from './medicine-value.service';

@Module({
  controllers: [MedicineValueController],
  providers: [MedicineValueService],
})
export class MedicineValueModule {}
