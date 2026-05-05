import { PartialType } from "@nestjs/mapped-types";
import { extend } from "slugify";
import { createProductVariantDto } from "./create_product_variant.dto";

export class UpdateProductVariantDto extends PartialType(createProductVariantDto){}