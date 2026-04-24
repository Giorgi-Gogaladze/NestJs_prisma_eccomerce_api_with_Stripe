import { IsNotEmpty, IsString } from "class-validator";

export class CreateAttributeDto{
    @IsString()
    @IsNotEmpty()
    name: string;
}