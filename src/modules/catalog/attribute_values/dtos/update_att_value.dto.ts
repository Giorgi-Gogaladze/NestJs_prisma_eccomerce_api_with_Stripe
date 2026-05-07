import { PartialType } from "@nestjs/mapped-types";
import { createAttValueDto } from "./create_att_value.dto";

export class UpdateAttValueDto extends PartialType(createAttValueDto){}