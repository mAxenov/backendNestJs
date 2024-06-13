import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './schemes/hotel.schema';
import { HotelRoom, HotelRoomSchema } from './schemes/hotelRoom.schema';
import { HotelService } from './hotel.service';
import { HotelRoomService } from './hotelRoom.service';
import { HotelController } from './hotel.controller';
import { FileUploadModule } from './multer/file-upload.module';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
    FileUploadModule,
    forwardRef(() => ReservationModule),
  ],
  controllers: [HotelController],
  providers: [HotelService, HotelRoomService],
  exports: [HotelService, HotelRoomService],
})
export class HotelModule {}
