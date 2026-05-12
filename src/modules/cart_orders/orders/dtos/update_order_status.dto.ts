import { Status } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateOrderStatusDto{
    @IsEnum(Status)
    @IsNotEmpty()
    status: Status
}