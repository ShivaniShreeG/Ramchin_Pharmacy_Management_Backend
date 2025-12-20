import { Controller, Get, Put, Param, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /profile/:role/:lodgeId/:userId
  @Get(':role/:shopId/:userId')
  async getProfile(
    @Param('role') role: string,
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
  ) {
    if (role === 'ADMIN') {
      return this.profileService.getAdminProfile(shopId, userId);
    } else if (role === 'ADMINISTRATOR') {
      return this.profileService.getAdministratorProfile(shopId, userId);
    } else {
      throw new NotFoundException(`Role "${role}" not recognized`);
    }
  }

  // PUT /profile/:role/:lodgeId/:userId
  @Put(':role/:shopId/:userId')
  async updateProfile(
    @Param('role') role: string,
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    if (role !== 'ADMIN' && role !== 'ADMINISTRATOR') {
      throw new NotFoundException(`Role "${role}" not recognized`);
    }

    return this.profileService.updateProfile(role as 'ADMIN' | 'ADMINISTRATOR', shopId, userId, dto);
  }
}
