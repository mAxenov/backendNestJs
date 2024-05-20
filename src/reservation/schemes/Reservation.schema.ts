import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Hotel } from 'src/hotel/schemes/hotel.schema';
import { HotelRoom } from 'src/hotel/schemes/hotelRoom.schema';

export type HotelRoomDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Hotel;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'HotelRoom',
    required: true,
  })
  roomId: HotelRoom;

  @Prop({ type: Date, required: true })
  dateStart: Date;

  @Prop({ type: Date, required: true })
  dateEnd: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
