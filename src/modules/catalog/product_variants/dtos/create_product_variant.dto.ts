import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsUUID, Min } from "class-validator";

export class createProductVariantDto {
    @IsNumber( {maxDecimalPlaces: 2})
    @Type(()=> Number)
    @Min(0)
    @IsNotEmpty()
    price: number;

    
    @IsNumber()
    @Type(()=> Number)
    @Min(0)
    @IsNotEmpty()
    stock: number;


    @IsArray()
    @IsUUID('4', {each: true})
    @IsNotEmpty({each: true})
    attributeValueIds: string[]

}
