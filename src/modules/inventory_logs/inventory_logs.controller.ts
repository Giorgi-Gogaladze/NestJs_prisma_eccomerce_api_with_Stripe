import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { InventoryLogsService } from "./inventory_logs.service";
import { AtGuard } from "../../shared/guards/at.guard";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { LogsQueryDto } from "./dtos/logs_query.dto";
import { Roles } from "../../shared/custom_decorators/roles.decorator";

@UseGuards(AtGuard, RolesGuard)
@Controller('inventory_logs')
export class InventoryLogsController{
    constructor(private readonly inventoryService: InventoryLogsService){}

    @Roles('ADMIN')
    @Get()
    async getAllLogs(
        @Query() dto: LogsQueryDto){
        return await this.inventoryService.getAllLogs(dto)
    }
}