import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('admins')
export class UserFullController {
  constructor(private readonly userService: UserService) {}

  @Get(':shopId/:userId')
  getUserWithAdmin(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
  ) {
    return this.userService.getUserWithAdmin(shopId, userId);
  }

  @Get(':shopId')
  getAdminsByShop(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.userService.getAdminsByShop(shopId);
  }

  @Delete(':shopId/admin/:userId')
  deleteAdmin(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
  ) {
    return this.userService.deleteAdmin(shopId, userId);
  }
}
