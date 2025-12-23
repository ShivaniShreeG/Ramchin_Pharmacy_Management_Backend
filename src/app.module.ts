import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppPaymentModule } from './app-payment/app-payment.module';
import { RegisterModule } from './register/register.module';
import { ShopBlockModule } from './shop-block/shop-block.module';
import { MessageModule } from './message/message.module';
import { SubmitTicketModule } from './submit/submit.module';
import { UserModule } from './user/user.module';
import { ShopModule } from './shop/shop.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HomeModule } from './home/home.module';
import { MedicineBatchModule } from './medicine-batch/medicine-batch.module';
import { MedicineModule } from './medicine/medicine.module';
import { StockMovementModule } from './stock/stock-movement.module';
import { InventoryModule } from './inventory/inventory.module';
import { BillingModule } from './billing/billing.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    AppPaymentModule,
    RegisterModule,
    ShopBlockModule,
    MessageModule,
    SubmitTicketModule,
    UserModule,
    ShopModule,
    ProfileModule,
    AdminModule,
    DashboardModule,
    HomeModule,
    MedicineBatchModule,
    MedicineModule,
    StockMovementModule,
    InventoryModule,
    BillingModule,
    FinanceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
