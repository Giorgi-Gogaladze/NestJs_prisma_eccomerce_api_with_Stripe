import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateCategoryDto{
    @IsNotEmpty()
    @IsString()
    @Max(100, {message: "Name shouldn't be more than 100 characters"})
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    @Min(3, {message: "Description should be at least 3 characters"})
    description?: string;

    @IsUUID('4', {message: "ParentId must be a valid UUID"})
    @IsOptional()
    parentId?: string | null;

    @IsBoolean()
    @IsOptional()
    isActiove?: boolean;

    
}