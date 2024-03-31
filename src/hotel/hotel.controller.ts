import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SearchRoomsParams } from './interfaces/SearchRoomsParams';
import { UpdateHotelParams } from './interfaces/UpdateHotelParams';
import { HotelService } from './hotel.service';
import { HotelRoomService } from './hotelRoom.service';
import { SearchHotelParams } from './interfaces/SearchHotelParams';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Roles } from 'src/auth/guards/roles';
import { RolesGuard } from 'src/auth/guards/roles.guard';
//import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
//import { Role } from 'src/auth/role.decorator';
//import { RolesGuard } from 'src/auth/roles.guard';

@Controller()
export class HotelController {
  constructor(
    private readonly HotelService: HotelService,
    private readonly HotelRoomService: HotelRoomService,
  ) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('common/hotel-rooms')
  async searchHotelRooms(@Query() params: SearchRoomsParams) {
    if (!params.isEnabled) {
      params.isEnabled = true;
    }
    return this.HotelRoomService.search(params);
  }

  @Get('common/hotel-rooms/:id')
  async getHotelRoom(@Param('id') id: string) {
    return this.HotelRoomService.findById(id);
  }

  @Post('admin/hotels')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createHotel(@Body() data: any) {
    return this.HotelService.create(data);
  }

  @Get('admin/hotels')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHotels(@Query() params: SearchHotelParams) {
    return this.HotelService.search(params);
  }

  @Put('admin/hotels/:id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateHotel(@Param('id') id: string, @Body() data: UpdateHotelParams) {
    return this.HotelService.update(id, data);
  }

  @Post('admin/hotel-rooms')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createHotelRoom(@Body() data: any) {
    return this.HotelRoomService.create(data);
  }

  @Put('admin/hotel-rooms/:id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateHotelRoom(@Param('id') id: string, @Body() data: any) {
    return this.HotelRoomService.update(id, data);
  }
}
