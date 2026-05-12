import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class createOrderDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    addressId: string;

    @IsString()
    @IsOptional()
    couponCode: string;
}