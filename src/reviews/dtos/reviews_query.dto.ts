import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export enum Sortby {
    NEWEST = 'newest',
    OLDEST = 'oldest',
}

export class ReviewsQueryDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    limit?: number = 10;

    @IsEnum(Sortby, {
        message: 'Invalid sortBy field. Use: newest or oldest'
    })
    sortBy?: Sortby = Sortby.NEWEST;

} 
