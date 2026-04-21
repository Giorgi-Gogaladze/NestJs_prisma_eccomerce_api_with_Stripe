import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoryDto } from "./create_category.dto";

export class UpdateCategoryDto extends PartialType(CreateCategoryDto){}