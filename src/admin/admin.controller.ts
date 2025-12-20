import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('details')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ====== Admin endpoints ======

  @Get(':shopId/admins')
  findAllAdmins(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.adminService.findAllAdminsByShop(shopId);
  }

  @Get(':shopId/admins/:userId')
  findAdmin(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string, // user_id is STRING in Prisma
  ) {
    return this.adminService.findAdminByShop(shopId, userId);
  }

  // ====== Administrator endpoints ======

  @Get(':shopId/administrators')
  findAllAdministrators(@Param('shopId', ParseIntPipe) shopId: number) {
    return this.adminService.findAllAdministratorsByShop(shopId);
  }

  @Get(':shopId/administrators/:userId')
  findAdministrator(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
  ) {
    return this.adminService.findAdministratorByShop(shopId, userId);
  }
}
