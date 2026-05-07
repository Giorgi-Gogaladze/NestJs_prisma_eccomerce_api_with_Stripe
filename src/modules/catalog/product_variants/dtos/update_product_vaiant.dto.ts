import { OmitType, PartialType } from "@nestjs/mapped-types";
import { createProductVariantDto } from "./create_product_variant.dto";

export class UpdateProductVariantDto extends PartialType(OmitType(createProductVariantDto, ['attributeValueIds'])){}
