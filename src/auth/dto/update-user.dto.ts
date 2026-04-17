import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    oldPassword?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    newPassword?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;
}
