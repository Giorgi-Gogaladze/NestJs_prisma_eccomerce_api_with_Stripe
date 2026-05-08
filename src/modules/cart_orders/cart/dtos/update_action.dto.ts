import { IsEnum, isNegative, IsNotEmpty, IsString } from "class-validator";

export class UpdateCartItemQuantityDto {
    @IsNotEmpty()
    @IsString()
    @IsEnum(['increment', 'decrement'])
    action: 'increment' | 'decrement';
}
