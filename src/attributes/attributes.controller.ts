import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AttributesService, AttributesWithValues } from './attributes.service';
import { CreateAttributeDto } from './dots/create_attribute.dto';
import { Attribute } from '@prisma/client';
import { UpdateAttributeDto } from './dots/update_attribute.dto';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';
import { Public } from '../custom_decorators/public.decorator';

@UseGuards(AtGuard, RolesGuard)
@Roles('ADMIN')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}


  @Post()
  async createAttribute(
    @Body() dto: CreateAttributeDto
  ): Promise<Attribute>{
    return await this.attributesService.createAttribute(dto);
  }

  @Public()
  @Get()
  async getAttributes(): Promise<AttributesWithValues[]>{
    return await this.attributesService.getAttributes();
  }

  @Public()
  @Get(':id')
  async getAttribute(
    @Param('id') id: string
  ): Promise<AttributesWithValues>{
    return await this.attributesService.getAttribute(id);
  }



  @Patch(':id')
  async updateAttribute(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDto
  ): Promise<Attribute>{
    return await this.attributesService.updateAttribute(id, dto);
  }


  @Delete(":id")
  async deleteAttribute(
    @Param('id') id: string
  ): Promise<{message: string}>{
    return await this.attributesService.deleteAttribute(id);
  }
}
