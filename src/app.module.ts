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
    HomeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
