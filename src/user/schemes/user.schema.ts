import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export type UserDocument = User & Document;

@Schema()
export class User {
  @IsNotEmpty()
  @IsEmail()
  @Prop({ required: true, unique: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  passwordHash: string;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  name: string;

  @IsString()
  @Prop({ required: true })
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true, default: 'client' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
