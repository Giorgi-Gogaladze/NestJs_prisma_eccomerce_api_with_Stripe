import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class SignupDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, {message: 'Password must be at least 8 characters long'})
    @MaxLength(20, {message: 'Password must be at most 20 characters long'})
    password: string;

    @IsString()
    @MinLength(3, {message: 'First name must be at least 3 characters long'})
    @MaxLength(50, {message: 'First name must be at most 50 characters long'})
    firstName: string;


    @IsString()
    @MinLength(3, {message: 'Last name must be at least 3 characters long'})
    @MaxLength(50, {message: 'Last name must be at most 50 characters long'})
    lastName: string;


}
