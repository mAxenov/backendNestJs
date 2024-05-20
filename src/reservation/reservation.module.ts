import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './schemes/Reservation.schema';
import { ReservationService } from './reservation.service';
import { HotelModule } from 'src/hotel/hotel.module';
import {
  ReservationClientController,
  ReservationManagerController,
} from './reservation.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    HotelModule,
  ],
  controllers: [ReservationClientController, ReservationManagerController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
