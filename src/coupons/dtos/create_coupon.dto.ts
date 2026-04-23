import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateCouponDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6, {message: "code must be at least 6 characters"})
    code: string;

    @IsNotEmpty()
    @IsNumber()
    @Max(100)
    @Min(1)
    discountPerc: number;

    @IsNotEmpty()
    @IsDateString({}, { message: "expiresAt must be a valid ISO 8601 date string (e.g., 2026-12-31)" })
    expiresAt: string;


    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}