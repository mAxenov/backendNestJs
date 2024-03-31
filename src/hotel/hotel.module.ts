import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './schemes/hotel.schema';
import { HotelRoom, HotelRoomSchema } from './schemes/hotelRoom.schema';
import { HotelService } from './hotel.service';
import { HotelRoomService } from './hotelRoom.service';
import { HotelController } from './hotel.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
  ],
  controllers: [HotelController],
  providers: [HotelService, HotelRoomService],
  exports: [HotelService, HotelRoomService],
})
export class HotelModule {}
