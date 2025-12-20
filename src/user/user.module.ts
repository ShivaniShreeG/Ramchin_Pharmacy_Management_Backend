import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserFullController } from './admin.controller';
import { AuthController } from './auth.controller';

@Module({
  controllers: [UserController,UserFullController,AuthController],
  providers: [UserService],
})
export class UserModule {}
