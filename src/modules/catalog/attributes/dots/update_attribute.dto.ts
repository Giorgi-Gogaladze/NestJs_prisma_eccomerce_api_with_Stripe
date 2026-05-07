import { PartialType } from "@nestjs/mapped-types";
import { CreateAttributeDto } from "./create_attribute.dto";

export class UpdateAttributeDto extends PartialType(CreateAttributeDto){}