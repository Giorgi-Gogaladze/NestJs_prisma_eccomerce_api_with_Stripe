import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { Type } from 'class-transformer'

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    basePrice: number;

    @IsNumber()
    @Max(100, {message: 'discount cant be more than 100%'})
    @Min(0)
    @Type(() => Number)
    discountPercent: number;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;

    @IsUUID()
    @IsNotEmpty()
    brandId: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;
}