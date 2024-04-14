import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @IsNotEmpty()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: ObjectId;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true })
  refreshToken: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
