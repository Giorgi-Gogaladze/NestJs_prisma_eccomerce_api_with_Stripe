import { IsBoolean, IsNotEmpty, isNotEmpty } from "class-validator";

export class ChangeStatusDto {
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

}
