import { IsNotEmpty, IsNumber, IsString, Min, } from "class-validator";

export class AddItemToCartDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNotEmpty()
    @IsString()
    variantId: string;
    
}
