import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AttributeValuesService } from './attribute_values.service';
import { createAttValueDto } from './dtos/create_att_value.dto';
import { AttributeValue } from '@prisma/client';
import { AttributesWithValues } from '../attributes/attributes.service';
import { UpdateAttValueDto } from './dtos/update_att_value.dto';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';
import { Public } from '../custom_decorators/public.decorator';

@UseGuards(AtGuard, RolesGuard)
@Roles('ADMIN')
@Controller('attribute-values')
export class AttributeValuesController {
  constructor(private readonly attributeValuesService: AttributeValuesService) {}

  @Public()
  @Get(':attributeId')
  async getAttValues(
    @Param('attributeId', ParseUUIDPipe) attributeId: string
  ): Promise<AttributesWithValues>{
    return await this.attributeValuesService.getAttributeValues(attributeId)
  }


  @Post("/:attributeId")
  async createAttributeValue(
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Body() dto: createAttValueDto
  ): Promise<AttributeValue>{
    return await this.attributeValuesService.createAttValue(dto, attributeId);
  }

  @Patch('/:attributeValId')
  async updateAttValue(
    @Param('attributeValId', ParseUUIDPipe) attributeValId: string,
    @Body() dto: UpdateAttValueDto
  ): Promise<AttributeValue>{
    return await this.attributeValuesService.updateAttValue(attributeValId, dto)
  }

  @Delete('/:attributeValId')
  async deleteAttVal(
    @Param('attributeValId', ParseUUIDPipe) attributeValId: string  //თუ ვინმე არასწორი ფორმატის აიდის გამოაგზავნის, ნესთი დაბლოკავს. 
  ): Promise<{message: string}>{
    return await this.attributeValuesService.deleteAttValue(attributeValId);
  }


}
