import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { User } from '../custom_decorators/user.decorator';
import { CreateAddressDto } from './dtos/create_address.dto';
import { Address } from '@prisma/client';
import { UpdateAddressDto } from './dtos/update_address.dto';
import { AtGuard } from '../guards/at.guard';

@UseGuards(AtGuard)
@Controller('address')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post('')
  async createAddress(
    @User('sub') userId: string,
    @Body() creaetAddressDto: CreateAddressDto
  ): Promise<Address>{
    return await this.addressesService.createAddress(userId, creaetAddressDto);
  }


  @Patch('update/:addressId')
  async updateAddress(
    @User('sub') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Param('addressId') addressId: string
  ): Promise<Address>{
    return await this.addressesService.updateAddress(addressId, userId, updateAddressDto );
  }


  @Get('')
  async getAddresses(
    @User('sub') userId: string
  ): Promise<Address[] | {message: string}>{
    return await this.addressesService.getAddresses(userId);
  }


  @Delete('delete/:addressId')
  async deleteAddress(
      @User('sub') userId: string,
      @Param('addressId') addressId: string
    ): Promise<{message: string}>{
      return await this.addressesService.deleteAddress(addressId, userId);
  }
}
