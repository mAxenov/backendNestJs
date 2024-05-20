import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IsNotEmpty, IsString, IsBoolean, IsArray } from 'class-validator';
import { Hotel } from './hotel.schema';

export type HotelRoomDocument = HotelRoom & Document;

@Schema({ timestamps: true })
export class HotelRoom {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Hotel', required: true })
  hotel: Hotel;

  @IsString()
  @Prop()
  title: string;

  @IsString()
  @Prop()
  description: string;

  @IsArray()
  @Prop({ default: [] })
  images: string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @IsBoolean()
  @IsNotEmpty()
  @Prop({ required: true, default: true })
  isEnabled: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);
