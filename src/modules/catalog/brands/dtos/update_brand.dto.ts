import { PartialType } from "@nestjs/mapped-types";
import { CreateBrandDto } from "./create_brand.dto";

export class UpdateBrandDto extends PartialType(CreateBrandDto){}