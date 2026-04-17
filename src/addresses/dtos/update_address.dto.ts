import { PartialType } from "@nestjs/mapped-types";
import { CreateAddressDto } from "./create_address.dto";

export class UpdateAddressDto extends PartialType(CreateAddressDto){};