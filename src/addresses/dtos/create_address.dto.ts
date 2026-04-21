import { IsBoolean, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateAddressDto {
    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    street: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{4,5}$/, { message: 'Zip code must be a 5-digit number' })
    zipCode: string;


    @IsNotEmpty()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be a valid international format' })
    phoneNumber: string;

    @IsBoolean()
    @IsNotEmpty()
    isDefault: boolean
}