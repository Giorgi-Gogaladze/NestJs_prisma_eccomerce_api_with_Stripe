import { IsNotEmpty, IsString } from "class-validator";

export class createAttValueDto {
    @IsNotEmpty()
    @IsString()
    value: string;
}