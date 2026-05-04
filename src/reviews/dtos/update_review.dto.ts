import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateReviewDto } from "./create_review.dto";

export class UpdateReviewDto extends PartialType(CreateReviewDto){}