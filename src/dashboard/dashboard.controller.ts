import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get(':id/stats')
  async getShopStats(@Param('id', ParseIntPipe) shopId: number) {
    return this.dashboardService.getShopStats(shopId);
  }

  @Get("counts")
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
