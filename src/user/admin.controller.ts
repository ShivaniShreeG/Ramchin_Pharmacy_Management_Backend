import { Controller, Get, Delete, Param, ParseIntPipe, Patch, Body } from '@nestjs/common';
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

    // 🔁 UPDATE ADMIN ACTIVE STATUS
  @Patch(':shopId/admin/:userId/status/update')
  updateAdminStatus(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
    @Body('is_active') isActive: boolean,
  ) {
    return this.userService.updateAdminStatus(shopId, userId, isActive);
  }

  @Get('user/details/active/:shopId')
  getUserAdminsByShop(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.userService.getUserAdminsByShop(shopId);
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
