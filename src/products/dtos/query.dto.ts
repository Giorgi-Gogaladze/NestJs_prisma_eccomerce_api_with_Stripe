import { Type } from "class-transformer";
import { IsEnum, IsNumber, isNumber, IsOptional, IsString, Min } from "class-validator";

export enum SortOrder {
    ASC = 'asc', 
    DESC = 'desc'
}

export enum SortBy {
    PRICE = 'price',
    CREATED_AT = 'createdAt',
    VIEWS = 'views',
    NAME = 'name',
    BRAND = 'brand'
}

export class QueryDto {
    @IsOptional()
    @IsString()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(SortBy, {
        message: 'Invalid sortBy field. Use: price, createdAt, views, name or brand'
    })
    sortBy?: SortBy = SortBy.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder, {
        message: 'sortOrder must be either asc or desc'
    })
    sortOrder?: SortOrder = SortOrder.ASC

    @IsOptional()
    @IsString()
    brand?: string;
     
    @IsOptional()
    @IsString()
    category?: string;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    maxPrice?: number;
}

