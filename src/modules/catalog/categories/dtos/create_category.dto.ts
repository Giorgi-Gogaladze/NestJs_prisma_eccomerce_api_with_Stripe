import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";

export class CreateCategoryDto{
    @IsNotEmpty()
    @IsString()
    @MaxLength(100, {message: "Name shouldn't be more than 100 characters"})
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    @MinLength(3, {message: "Description should be at least 3 characters"})
    description?: string;

    @IsUUID('4', {message: "ParentId must be a valid UUID"})
    @IsOptional()
    @ValidateIf((o) => o.parentId !== '')
    parentId?: string | null;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    
}