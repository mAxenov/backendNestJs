import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import {
  SearchRoomsParams,
  SearchRoomsParamsAdmin,
} from './interfaces/SearchRoomsParams';
import { UpdateHotelParams } from './interfaces/UpdateHotelParams';

import { SearchHotelParams } from './interfaces/SearchHotelParams';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Roles } from 'src/auth/guards/roles';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Hotel } from './schemes/hotel.schema';
import { HotelService } from './hotel.service';
import { HotelRoomService } from './hotelRoom.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { isArray } from 'class-validator';

@Controller()
export class HotelController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly hotelRoomService: HotelRoomService,
  ) {}

  @Post('admin/hotels')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async createHotel(@UploadedFiles() images, @Body() data: Partial<Hotel>) {
    console.log(images);
    return this.hotelService.create({
      ...data,
      images: images.map((image) => `/files/images/${image.filename}`),
    });
  }

  @Get('common/hotels')
  async getHotels(@Query() params: SearchHotelParams) {
    return await this.hotelService.search(params);
  }

  @Get('files/images/:url')
  async getFile(@Param('url') url: string, @Res() res) {
    res.sendFile(url, {
      root: './uploads',
    });
  }

  @Put('admin/hotels/:id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateHotel(
    @UploadedFiles() images,
    @Param('id') id: string,
    @Body() data: UpdateHotelParams,
  ) {
    let newImages: string[] = [];
    if (isArray<string>(data.images)) newImages = data.images;
    if (typeof data.images === 'string' && data.images)
      newImages.push(data.images);
    newImages = [
      ...newImages,
      ...images.map((image) => `/files/images/${image.filename}`),
    ];

    return this.hotelService.update(id, {
      ...data,
      images: newImages,
    });
  }

  @Post('admin/hotel-rooms')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async createHotelRoom(@UploadedFiles() images, @Body() data: any) {
    return this.hotelRoomService.create({
      ...data,
      hotel: data.hotelId,
      images: images.map((image) => `/files/images/${image.filename}`),
    });
  }

  @Put('admin/hotel-rooms/:id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateHotelRoom(
    @UploadedFiles() images,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    let newImages: string[] = [];
    if (isArray<string>(data.images)) newImages = data.images;
    if (typeof data.images === 'string' && data.images)
      newImages.push(data.images);
    newImages = [
      ...newImages,
      ...images.map((image) => `/files/images/${image.filename}`),
    ];

    return this.hotelRoomService.update(id, {
      ...data,
      images: newImages,
    });
  }

  @Get('admin/hotel-rooms')
  async searchHotelRoomsAdmin(@Query() params: SearchRoomsParamsAdmin) {
    if (!params.isEnabled) {
      params.isEnabled = true;
    }
    return this.hotelRoomService.searchAdmin(params);
  }

  @Get('common/hotel-rooms')
  async searchHotelRooms(@Query() params: SearchRoomsParams) {
    if (!params.isEnabled) {
      params.isEnabled = true;
    }
    return this.hotelRoomService.search(params);
  }

  @Get('common/hotel-rooms/:id')
  async getHotelRoom(@Param('id') id: string) {
    return this.hotelRoomService.findById(id);
  }
}
