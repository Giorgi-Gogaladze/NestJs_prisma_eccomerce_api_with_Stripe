import { PartialType } from "@nestjs/mapped-types";
import { createAttValueDto } from "./create_att_value.dto";

export class updateAttValueDto extends PartialType(createAttValueDto){}