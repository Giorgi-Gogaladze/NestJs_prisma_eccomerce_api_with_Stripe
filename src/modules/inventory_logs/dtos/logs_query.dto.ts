import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { SortOrder } from "../../catalog/products/dtos/query.dto";
import { InventoryChangeReason } from "@prisma/client";

export class LogsQueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number;


    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    limit?: number;


    @IsOptional()
    @IsEnum(SortOrder, {
        message: 'sortOrder must be either asc or desc'
    })
    sortOrder?: SortOrder = SortOrder.ASC


    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(InventoryChangeReason, {
        message: 'reasons must be SALE, RETURN, CANCELLATION, RESTOCK or OTHER'})
    reason?: string;

}