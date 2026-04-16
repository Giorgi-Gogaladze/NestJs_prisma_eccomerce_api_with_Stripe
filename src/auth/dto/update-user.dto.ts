import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

export class UpdateUserDto {
    @IsEmail()
    email?: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    oldPassword?: string;

    @IsString()
    @MinLength(6)
    newPassword?: string;

    @IsString()
    firstName?: string;

    @IsString()
    lastName?: string;
}
