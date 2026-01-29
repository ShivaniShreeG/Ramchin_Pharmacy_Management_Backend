import { Controller, Get, Post, Param, Body, ParseIntPipe, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

   @Get(':shopId/check-user/:userId')
  checkUserAvailability(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
  ) {
    return this.userService.checkUserAvailability(shopId, userId);
  }

  @Get(':shopId')
  findAllByShop(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.userService.findAllByShop(shopId);
  }

  @Get(':shopId/:userId')
  findOneByShop(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
  ) {
    return this.userService.findOneByShop(shopId, userId);
  }

  @Post(':shopId/admin')
  addAdmin(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.addAdmin({ ...dto, shop_id: shopId });
  }
  
@Patch('admins/:shopId/:userId/access')
async updateAdminAccess(
  @Param('shopId', ParseIntPipe) shopId: number, // 🔥 REQUIRED
  @Param('userId') userId: string,
  @Body() body: { access: any },
) {
  return this.userService.updateAdminAccess(
    shopId,
    userId,
    body.access,
  );
}


}
