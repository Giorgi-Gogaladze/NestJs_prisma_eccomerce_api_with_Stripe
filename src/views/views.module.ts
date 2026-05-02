import { Module } from "@nestjs/common";
import { ViewsService } from "./views.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({ 
    providers: [ViewsService, PrismaService],
    exports: [ViewsService]
})
export class ViewsModule{}