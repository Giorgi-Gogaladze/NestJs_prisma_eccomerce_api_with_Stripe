import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DetailedOrder, OrdersService, OrderWithCount, OrderWithItems } from './orders.service';
import { User } from '../../../shared/custom_decorators/user.decorator';
import { createOrderDto } from './dtos/create_order.dto';
import { UpdateOrderStatusDto } from './dtos/update_order_status.dto';
import { Order } from '@prisma/client';
import { AtGuard } from '../../../shared/guards/at.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/custom_decorators/roles.decorator';

@UseGuards(AtGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @User() user: any,
    @Body() dto: createOrderDto
  ): Promise<OrderWithItems>{
    return await this.ordersService.createOrder(user.sub, dto)
  }

  @Get()
  async getMyOrders(
    @User() user: any
  ):Promise<OrderWithCount[]>{
    return await this.ordersService.getMyOrders(user.sub)
  }

  @Roles('ADMIN')
  @Get()
  async getActiveOrders(): Promise<Order[]>{
    return await this.ordersService.getActiveOrders()
  }

  @Roles('ADMIN')
  @Get()
  async getCanceledOrders(){
    return await this.ordersService.getCanceledOrders()
  }


  @Get(':orderId')
    async getOrderById(
      @Param('orderId') orderId: string,
      @User() user: any
    ): Promise<DetailedOrder>{
      return await this.ordersService.getOrderById(orderId, user.sub)
  }

  @Roles('ADMIN')
  @Patch('/:orderId')
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto
  ): Promise<Order>{
    return await this.ordersService.updateStatus(orderId, dto)
  }

  
  @Patch('cancel/:orderId')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @User() user: any
  ){
    return await this.ordersService.cancelOrder(orderId, user.sub)
  }


}
