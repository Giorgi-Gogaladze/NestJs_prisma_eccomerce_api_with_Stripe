import { Controller } from '@nestjs/common';
import { AttributeValuesService } from './attribute_values.service';

@Controller('attribute-values')
export class AttributeValuesController {
  constructor(private readonly attributeValuesService: AttributeValuesService) {}
}
