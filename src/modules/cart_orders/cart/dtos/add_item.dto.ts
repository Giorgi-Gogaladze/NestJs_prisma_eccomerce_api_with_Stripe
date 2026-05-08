import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, } from "class-validator";

export class AddItemToCartDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity: number = 1;

    @IsNotEmpty()
    @IsString()
    variantId: string;
    
}
