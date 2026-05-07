import { Module } from "@nestjs/common";
import { ViewsService } from "./views.service";
import { PrismaModule } from "../../../shared/prisma/prisma.module";

@Module({ 
    imports: [PrismaModule],
    providers: [ViewsService],
    exports: [ViewsService]
})
export class ViewsModule{}
