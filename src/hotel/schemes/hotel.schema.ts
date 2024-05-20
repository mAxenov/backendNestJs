import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export type HotelDocument = Hotel & Document;

@Schema({ timestamps: true })
export class Hotel {
  @IsNotEmpty()
  @IsString()
  @Prop({ required: true, unique: true })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  description: string;

  @IsArray()
  @Prop({ default: [] })
  images: string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
